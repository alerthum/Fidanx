"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AyarlarPage() {
    const [categories, setCategories] = useState<string[]>(['Meyve', 'Süs', 'Endüstriyel']);
    const [productionStages, setProductionStages] = useState<string[]>(['TEPSİ', 'KÜÇÜK_SAKSI', 'BÜYÜK_SAKSI', 'SATIŞA_HAZIR']);
    const [users, setUsers] = useState<any[]>([
        { name: 'Admin Kullanıcı', role: 'Süper Yetkili', email: 'admin@fidanx.com' }
    ]);
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Personel' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/tenants/demo-tenant`);
            const data = await res.json();
            if (data.settings?.categories) setCategories(data.settings.categories);
            if (data.settings?.productionStages) setProductionStages(data.settings.productionStages);
            if (data.settings?.users) setUsers(data.settings.users);
        } catch (err) { }
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers([...users, newUser]);
        setNewUser({ name: '', email: '', role: 'Personel' });
        setIsUserModalOpen(false);
    };

    const handleRemoveUser = (email: string) => {
        setUsers(users.filter(u => u.email !== email));
    };

    const handleClearData = async () => {
        if (confirm('Tüm üretim ve stok verileri silinecektir. Emin misiniz?')) {
            try {
                const res = await fetch(`${API_URL}/seed/clear?tenantId=demo-tenant`, { method: 'DELETE' });
                if (res.ok) alert('Sistem sıfırlandı.');
                else alert('Sunucu hatası.');
            } catch (err) {
                alert('Sunucuya bağlanılamadı.');
            }
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/tenants/demo-tenant/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories, users, productionStages }),
            });
            if (res.ok) alert('Ayarlar başarıyla kaydedildi ve veritabanına yazıldı.');
            else alert('Kaydetme başarısız: ' + await res.text());
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sistem Ayarları</h1>
                        <p className="text-sm text-slate-500 font-medium">Kullanıcı yönetimi, roller ve parametreler.</p>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? 'Buluta Yazılıyor...' : '✓ Tüm Değişiklikleri Kaydet'}
                    </button>
                </header>

                <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Kullanıcı Yönetimi */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Kullanıcı & Erişim Yönetimi</h3>
                            <button
                                onClick={() => setIsUserModalOpen(true)}
                                className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition"
                            >
                                + Yeni Kullanıcı Ekle
                            </button>
                        </div>
                        <div className="flex-1">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Kullanıcı Bilgisi</th>
                                        <th className="px-6 py-3">Yetki Seviyesi</th>
                                        <th className="px-6 py-3 text-right">Eylem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 leading-tight">{user.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${user.role === 'Süper Yetkili' || user.role === 'Admin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRemoveUser(user.email)}
                                                    className="text-slate-300 hover:text-rose-500 transition-colors font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    Kaldır
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400 italic text-xs">Henüz kullanıcı tanımlanmadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Parametreler */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Üretim Safhaları (Dinamik Şaşırtma)</h3>
                            <div className="flex flex-wrap gap-2">
                                {productionStages.map(s => (
                                    <span key={s} className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2 group hover:border-emerald-300 transition-all">
                                        {s}
                                        <button onClick={() => setProductionStages(productionStages.filter(x => x !== s))} className="text-emerald-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <input
                                    id="new-stage-input"
                                    type="text"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 shadow-sm transition"
                                    placeholder="Örn: 1. Şaşırtma"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value;
                                            if (val) {
                                                setProductionStages([...productionStages, val]);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('new-stage-input') as HTMLInputElement;
                                        if (input.value) {
                                            setProductionStages([...productionStages, input.value]);
                                            input.value = '';
                                        }
                                    }}
                                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition active:scale-95 shadow-md shadow-emerald-100"
                                >
                                    Ekle
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">Taşıma (Şaşırtma) butonuna basıldığında bu safhalar sırasıyla önerilecektir.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Stok Kategorileri</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <span key={c} className="bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold border border-slate-100 flex items-center gap-2 group hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                                        {c}
                                        <button onClick={() => setCategories(categories.filter(x => x !== c))} className="text-slate-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 shadow-sm transition"
                                    placeholder="Örn: Zeytin Fidanı"
                                />
                                <button
                                    onClick={() => { if (newCategory) { setCategories([...categories, newCategory]); setNewCategory(''); } }}
                                    className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition active:scale-95"
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>

                        <div className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="font-black text-rose-800 uppercase text-[10px] tracking-[0.2em] mb-2">Veritabanını Sıfırla</h3>
                                <p className="text-xs text-rose-600 font-medium">Tüm üretim, stok ve analiz verileri kalıcı olarak silinecektir.</p>
                            </div>
                            <button
                                onClick={handleClearData}
                                className="relative z-10 bg-white text-rose-600 border border-rose-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                SİSTEMİ TEMİZLE
                            </button>
                            {/* Warning Decoration */}
                            <div className="absolute right-[-20px] top-[-20px] text-[100px] opacity-5 pointer-events-none grayscale">⚠️</div>
                        </div>
                    </div>
                </div>

                {/* User Creation Modal */}
                {isUserModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Yeni Kullanıcı Hesabı</h3>
                            <form onSubmit={handleAddUser} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tam Adı</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition"
                                        placeholder="Örn: Ahmet Yılmaz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">E-Posta Adresi</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition"
                                        placeholder="ahmet@fidanx.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Erişim Yetkisi</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition appearance-none bg-slate-50"
                                    >
                                        <option value="Admin">Süper Yetkili (Admin)</option>
                                        <option value="Personel">Saha Personeli</option>
                                        <option value="Gözlemci">Sadece Görüntüleme</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition uppercase text-xs tracking-widest">Vazgeç</button>
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95 uppercase text-xs tracking-widest">Kullanıcıyı Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
