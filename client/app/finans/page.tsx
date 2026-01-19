"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

export default function FinansPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Enerji',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        note: '',
        batchId: ''
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchExpenses();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/production?tenantId=demo-tenant`);
            const data = await res.json();
            setBatches(data);
        } catch (err) { }
    };

    const fetchExpenses = async () => {
        try {
            const res = await fetch(`${API_URL}/finans/expenses?tenantId=demo-tenant`);
            const data = await res.json();
            setExpenses(data);
        } catch (err) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/finans/expenses?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', category: 'Enerji', amount: 0, date: new Date().toISOString().split('T')[0], note: '', batchId: '' });
                fetchExpenses();
            }
        } catch (err) { }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${API_URL}/finans/expenses/${id}?tenantId=demo-tenant`, { method: 'DELETE' });
            fetchExpenses();
        } catch (err) { }
    };

    const totalExpense = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center lg:sticky lg:top-0 z-30 gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Finans & Gider Takibi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">İşletme giderleri ve maliyet yönetimi.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <ExportButton title="İşletme Gider Raporu" tableId="gider-table" />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>+</span> Yeni Gider Kaydı
                        </button>
                    </div>
                </header>

                <div className="p-4 lg:p-8 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Lansman Gideri</p>
                            <p className="text-3xl font-black text-slate-800 font-mono">₺{totalExpense.toLocaleString()}</p>
                        </div>
                        <div className="bg-emerald-600 p-6 rounded-3xl shadow-xl shadow-emerald-200 text-white">
                            <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Cari Ay Gideri</p>
                            <p className="text-3xl font-black font-mono">₺{totalExpense.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aylık Ortalama</p>
                            <p className="text-3xl font-black text-slate-800 font-mono">₺{(totalExpense / 1).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Expense Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left" id="gider-table">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Açıklama / Başlık</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4 text-center">İlişkili Parti (LOT)</th>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4">Tutar</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50 transition group text-sm">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700">{exp.title}</p>
                                            <p className="text-[10px] text-slate-400 italic">{exp.note || 'Not yok'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${exp.category === 'Enerji' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                exp.category === 'Personel' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {exp.batchId ? (
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">
                                                    {batches.find(b => b.id === exp.batchId)?.lotId || 'Seçili Parti'}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-[10px]">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 font-mono">₺{parseFloat(exp.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(exp.id)} className="p-2 text-slate-300 hover:text-rose-500 transition">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr><td colSpan={5} className="py-24 text-center text-slate-400 italic">Henüz gider kaydı bulunmuyor.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Yeni Gider Kaydı</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Gider Başlığı</label>
                                    <input required placeholder="Örn: Elektrik Faturası - Ocak" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-emerald-500 text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">İlişkili Üretim Partisi (Opsiyonel)</label>
                                    <select className="w-full p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 outline-none focus:border-emerald-500 text-sm font-bold text-emerald-800" value={formData.batchId} onChange={e => setFormData({ ...formData, batchId: e.target.value })}>
                                        <option value="">Genel Gider (Parti Bağımsız)</option>
                                        {Array.isArray(batches) && batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.lotId} - {b.plantName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
                                        <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-emerald-500 text-sm" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option value="Enerji">⚡ Enerji (Elek/Su)</option>
                                            <option value="Personel">👥 Personel / Maaş</option>
                                            <option value="Bakım">🔧 Bakım / Onarım</option>
                                            <option value="Lojistik">🚚 Lojistik / Yakıt</option>
                                            <option value="Diğer">📦 Diğer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tutar (₺)</label>
                                        <input required type="number" placeholder="0.00" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-emerald-500 text-sm" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Harcama Tarihi</label>
                                    <input required type="date" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-emerald-500 text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Not</label>
                                    <input placeholder="Ek bilgiler..." className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-emerald-500 text-sm" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500">İptal</button>
                                    <button type="submit" className="flex-1 py-4 bg-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-emerald-200">Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
