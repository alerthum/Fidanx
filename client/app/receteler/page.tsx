"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Başlangıç',
        ingredients: '',
        instructions: ''
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await fetch(`${API_URL}/recipes?tenantId=demo-tenant`);
            const data = await res.json();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i !== '')
        };

        try {
            const url = editingRecipe
                ? `${API_URL}/recipes/${editingRecipe.id}?tenantId=demo-tenant`
                : `${API_URL}/recipes?tenantId=demo-tenant`;

            const res = await fetch(url, {
                method: editingRecipe ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingRecipe(null);
                setFormData({ name: '', category: 'Başlangıç', ingredients: '', instructions: '' });
                fetchRecipes();
            }
        } catch (err) {
            alert('Sunucu hatası.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu reçeteyi silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${API_URL}/recipes/${id}?tenantId=demo-tenant`, { method: 'DELETE' });
            fetchRecipes();
        } catch (err) { }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Reçete Yönetimi</h1>
                        <p className="text-sm text-slate-500">Fidan büyüme evreleri için toprak ve bakım karışımları.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingRecipe(null);
                            setFormData({ name: '', category: 'Başlangıç', ingredients: '', instructions: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md transition"
                    >
                        + Yeni Reçete Oluştur
                    </button>
                </header>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(recipes) && recipes.map((recipe) => (
                        <div key={recipe.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${recipe.category === 'Başlangıç' ? 'bg-blue-50 text-blue-600' :
                                            recipe.category === 'Gelişim' ? 'bg-purple-50 text-purple-600' :
                                                'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {recipe.category}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => {
                                                setEditingRecipe(recipe);
                                                setFormData({
                                                    name: recipe.name,
                                                    category: recipe.category,
                                                    ingredients: recipe.ingredients?.join(', ') || '',
                                                    instructions: recipe.instructions || ''
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(recipe.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{recipe.name}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">İçerik Karışımı</p>
                                        <div className="flex flex-wrap gap-1">
                                            {recipe.ingredients?.map((ing: string, i: number) => (
                                                <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                                                    {ing}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {recipe.instructions && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Uygulama Notu</p>
                                            <p className="text-xs text-slate-500 italic leading-relaxed">"{recipe.instructions}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">
                                {editingRecipe ? 'Reçeteyi Düzenle' : 'Yeni Reçete Oluştur'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reçete Adı</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Örn: Zeytin Başlangıç Mix"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    >
                                        <option value="Başlangıç">🌱 Başlangıç</option>
                                        <option value="Gelişim">🪴 Gelişim</option>
                                        <option value="Final">🌳 Final / Arazi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">İçerikler (Virgülle Ayırın)</label>
                                    <textarea
                                        required
                                        placeholder="%50 Torf, %30 Perlit, %20 Gübre"
                                        value={formData.ingredients}
                                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm h-24 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Uygulama Talimatı</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: Haftada 2 kez sulayın, direkt güneşten koruyun."
                                        value={formData.instructions}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition"
                                    >
                                        {editingRecipe ? 'Değişiklikleri Kaydet' : 'Reçeteyi Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
