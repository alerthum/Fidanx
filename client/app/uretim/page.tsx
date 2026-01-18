"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function UretimPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [motherTrees, setMotherTrees] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBatch, setNewBatch] = useState({
        motherId: '',
        name: '',
        quantity: 0,
        startDate: new Date().toISOString().split('T')[0]
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchBatches();
        fetchMotherTrees();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/production?tenantId=demo-tenant`);
            const data = await res.json();
            setBatches(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    const fetchMotherTrees = async () => {
        try {
            const res = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            const data = await res.json();
            setMotherTrees(Array.isArray(data) ? data.filter((p: any) => p.type === 'MOTHER_TREE') : []);
        } catch (err) { }
    };

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/production?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBatch),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewBatch({ motherId: '', name: '', quantity: 0, startDate: new Date().toISOString().split('T')[0] });
                fetchBatches();
            }
        } catch (err) {
            alert('Sunucu hatası.');
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Üretim Takibi</h1>
                        <p className="text-sm text-slate-500">Ana ağaçlardan alınan dalların büyüme ve takip süreci.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md transition"
                    >
                        + Yeni Üretim Partisi (Dikim)
                    </button>
                </header>

                <div className="p-8 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Aktif Partiler</h3>
                            <p className="text-3xl font-bold text-slate-800">{batches.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Toplam Büyüyen Fide</h3>
                            <p className="text-3xl font-bold text-emerald-600">8,420</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Ana Ağaç Sayısı</h3>
                            <p className="text-3xl font-bold text-slate-800">{motherTrees.length}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Parti Adı / Kaynak</th>
                                    <th className="px-6 py-4">Miktar</th>
                                    <th className="px-6 py-4">Başlangıç</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">Aksiyonlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {Array.isArray(batches) && batches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">
                                                    {batch.type === 'Çelikleme' ? '✂️' : batch.type === 'Aşı' ? '🌿' : '🌱'}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-slate-700 tracking-tight">{batch.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        Kaynak: {motherTrees.find(m => m.id === (batch.motherTreeId || batch.motherId))?.name || 'Bilinmeyen Ana Ağaç'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-600">
                                            <p>{batch.quantity} Adet</p>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase">{batch.type || 'STANDART'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {batch.startDate ? new Date(batch.startDate).toLocaleDateString('tr-TR') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${batch.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {batch.status === 'GROWING' ? 'Büyüme Sürecinde' : batch.status === 'COMPLETED' ? 'Tamamlandı' : 'Beklemede'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-300 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-colors">GÖRÜNTÜLE</button>
                                        </td>
                                    </tr>
                                ))}
                                {(!Array.isArray(batches) || (batches.length === 0)) && (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="text-4xl mb-4">🚜</div>
                                            <p className="text-slate-400 font-medium italic">
                                                {!Array.isArray(batches) ? 'Üretim verileri alınamadı.' : 'Henüz bir üretim partisi kaydı bulunmuyor.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Üretim Başlat (Dikim)</h3>
                            <form onSubmit={handleAddBatch} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kaynak Ana Ağaç / Tür</label>
                                    <select
                                        required
                                        value={newBatch.motherId}
                                        onChange={(e) => setNewBatch({ ...newBatch, motherId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    >
                                        <option value="">Seçiniz...</option>
                                        {motherTrees.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Parti / Blok Adı</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Örn: 2024-AYVALIK-BLOK-A"
                                        value={newBatch.name}
                                        onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Adet / Miktar</label>
                                        <input
                                            required
                                            type="number"
                                            value={newBatch.quantity}
                                            onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Dikim Tarihi</label>
                                        <input
                                            required
                                            type="date"
                                            value={newBatch.startDate}
                                            onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                        />
                                    </div>
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
                                        Üretimi Kaydet
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
