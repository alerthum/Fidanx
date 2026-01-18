"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Başlangıç',
        items: [] as { materialId: string, amount: number }[],
        instructions: ''
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchRecipes();
        fetchMaterials();
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await fetch(`${API_URL}/recipes?tenantId=demo-tenant`);
            const data = await res.json();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            const data = await res.json();
            // Hammadde ve Ambalaj olanları filtrele
            const filtered = data.filter((p: any) => p.type === 'RAW_MATERIAL' || p.type === 'PACKAGING');
            setMaterials(filtered);
        } catch (err) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData
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
                setFormData({ name: '', category: 'Başlangıç', items: [], instructions: '' });
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
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center lg:sticky lg:top-0 z-30 gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Reçete Yönetimi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Fidan büyüme evreleri için toprak ve bakım karışımları.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingRecipe(null);
                            setFormData({ name: '', category: 'Başlangıç', items: [], instructions: '' });
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition active:scale-95"
                    >
                        + Yeni Reçete Oluştur
                    </button>
                </header>

                <div className="p-4 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {Array.isArray(recipes) && recipes.map((recipe) => (
                        <div key={recipe.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                            <div className="p-5 lg:p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${recipe.category === 'Başlangıç' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        recipe.category === 'Gelişim' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {recipe.category}
                                    </span>
                                    <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => {
                                                setEditingRecipe(recipe);
                                                setFormData({
                                                    name: recipe.name,
                                                    category: recipe.category,
                                                    items: recipe.items || [],
                                                    instructions: recipe.instructions || ''
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition shadow-sm border border-slate-100"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(recipe.id)}
                                            className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600 transition shadow-sm border border-slate-100"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 tracking-tight">{recipe.name}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">İçerik & Sarfiyat (MRP)</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {recipe.items?.map((item: any, i: number) => {
                                                const mat = materials.find(m => m.id === item.materialId);
                                                return (
                                                    <span key={i} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5">
                                                        <span className="opacity-50">🧱</span>
                                                        {mat ? mat.name : 'Silinmiş Materyal'}
                                                        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[8px]">{item.amount}</span>
                                                    </span>
                                                );
                                            })}
                                            {(!recipe.items || recipe.items.length === 0) && (
                                                <span className="text-[10px] text-slate-400 italic">Materyal tanımlanmamış.</span>
                                            )}
                                        </div>
                                    </div>
                                    {recipe.instructions && (
                                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uygulama Talimatı</p>
                                            <p className="text-xs text-slate-500 italic leading-relaxed">"{recipe.instructions}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!Array.isArray(recipes) || recipes.length === 0) && (
                        <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-slate-200">
                            <div className="text-4xl mb-4">🧪</div>
                            <p className="text-slate-400 font-medium italic">Henüz bir reçete kaydı bulunmuyor.</p>
                        </div>
                    )}
                </div>

                {/* Recipe Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    {editingRecipe ? 'Reçeteyi Düzenle' : 'Yeni Reçete Oluştur'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="sm:hidden text-slate-400 text-2xl">×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reçete Adı</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Örn: Zeytin Başlangıç Mix"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                    >
                                        <option value="Başlangıç">🌱 Başlangıç</option>
                                        <option value="Gelişim">🪴 Gelişim</option>
                                        <option value="Final">🌳 Final / Arazi</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hammadde & Malzemeler</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, items: [...formData.items, { materialId: '', amount: 1 }] })}
                                            className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                                        >
                                            + Satır Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-top-1 transition-all">
                                                <select
                                                    required
                                                    value={item.materialId}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[idx].materialId = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 bg-slate-50"
                                                >
                                                    <option value="">Materyal Seçin...</option>
                                                    {materials.map(m => (
                                                        <option key={m.id} value={m.id}>{m.type === 'RAW_MATERIAL' ? '🧱' : '📦'} {m.name} (Stok: {m.currentStock || 0})</option>
                                                    ))}
                                                </select>
                                                <input
                                                    required
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    placeholder="Miktar"
                                                    value={item.amount}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[idx].amount = parseFloat(e.target.value) || 0;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) })}
                                                    className="text-slate-300 hover:text-rose-500 transition px-2"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {formData.items.length === 0 && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                                    Henüz malzeme eklenmedi. <br /> Stok düşümü için malzeme eklemelisiniz.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Uygulama Talimatı</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: Haftada 2 kez sulayın"
                                        value={formData.instructions}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition"
                                    >
                                        {editingRecipe ? 'Güncelle' : 'Kaydet'}
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
