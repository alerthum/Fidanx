"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function UretimPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [motherTrees, setMotherTrees] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [newBatch, setNewBatch] = useState({
        motherId: '',
        name: '',
        quantity: 0,
        type: 'Çelikleme',
        recipeId: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchBatches();
        fetchMotherTrees();
        fetchRecipes();
    }, []);

    // Tarih formatlama yardımcısı
    const formatDate = (dateInput: any, includeTime = true) => {
        if (!dateInput) return '-';
        try {
            let date: Date;

            if (dateInput && typeof dateInput === 'object') {
                // serialized Firestore timestamp (+ possible leading underscore from some serializations)
                const seconds = dateInput.seconds || dateInput._seconds;
                if (seconds) {
                    date = new Date(seconds * 1000);
                } else {
                    date = new Date(dateInput);
                }
            } else {
                date = new Date(dateInput);
            }

            if (isNaN(date.getTime())) return '-';

            return date.toLocaleDateString('tr-TR', includeTime ? {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            } : {
                year: 'numeric', month: '2-digit', day: '2-digit'
            });
        } catch (e) { return '-'; }
    };

    const fetchRecipes = async () => {
        try {
            const res = await fetch(`${API_URL}/recipes?tenantId=demo-tenant`);
            const data = await res.json();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/production/batches?tenantId=demo-tenant`);
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
            const res = await fetch(`${API_URL}/production/batches?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBatch),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewBatch({
                    motherId: '',
                    name: '',
                    quantity: 0,
                    type: 'Çelikleme',
                    recipeId: '',
                    startDate: new Date().toISOString().split('T')[0]
                });
                fetchBatches();
            }
        } catch (err) {
            alert('Sunucu hatası.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center lg:sticky lg:top-0 z-30 gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Üretim Takibi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Ana ağaçlardan alınan dalların büyüme süreci.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition active:scale-95"
                    >
                        + Yeni Üretim Başlat
                    </button>
                </header>

                <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aktif Partiler</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-slate-800">{batches.length}</p>
                        </div>
                        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Toplam Büyüyen</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-emerald-600">
                                {batches.reduce((acc, b) => acc + (b.quantity || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ana Ağaç Hattı</h3>
                            <p className="text-2xl lg:text-3xl font-bold text-slate-800">{motherTrees.length}</p>
                        </div>
                    </div>

                    {/* Production List - Desktop Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hidden lg:block">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Parti & Lot ID</th>
                                    <th className="px-6 py-4">Miktar & Tip</th>
                                    <th className="px-6 py-4">Uygulanan Reçete</th>
                                    <th className="px-6 py-4">Gelişim Safhası</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {Array.isArray(batches) && batches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl shadow-sm border border-slate-200">
                                                    {batch.stage === 'TEPSİ' ? '🛹' : batch.stage === 'KÜÇÜK_SAKSI' ? '🪴' : '🌲'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 tracking-tight">{batch.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                                                        {batch.lotId || `LOT-${batch.id.substring(0, 6)}`.toUpperCase()}
                                                    </p>
                                                    <p className="text-[9px] text-emerald-600 font-black uppercase mt-0.5">
                                                        {motherTrees.find(m => m.id === (batch.motherTreeId || batch.motherId))?.name || 'Ana Ağaç Bilgisi Bekleniyor...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700">{batch.quantity} Adet</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase">{batch.type || 'Çelikleme'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100 hover:bg-amber-100 transition cursor-help group relative">
                                                <span className="text-[10px] font-black uppercase tracking-tight">
                                                    {recipes.find(r => r.id === batch.recipeId)?.name || 'Reçete Seçilmedi'}
                                                </span>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 text-white p-3 rounded-xl text-[10px] shadow-2xl z-50">
                                                    <p className="font-black uppercase mb-1 border-b border-slate-700 pb-1">Uygulanan Karışım</p>
                                                    <p className="text-slate-400 leading-relaxed font-medium">
                                                        {recipes.find(r => r.id === batch.recipeId)?.ingredients?.join(', ') || 'İçerik bilgisi girilmemiş.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${batch.stage === 'TEPSİ' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    batch.stage === 'KÜÇÜK_SAKSI' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {batch.stage?.replace('_', ' ') || 'SAFHA BELİRSİZ'}
                                                </span>
                                                <p className="text-[9px] text-slate-400 font-medium">
                                                    {formatDate(batch.startDate, false)} GİRİŞ
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedBatch(batch); setIsHistoryOpen(true); }}
                                                    className="bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 p-2 rounded-lg transition-all shadow-sm active:scale-90"
                                                    title="Şecere / Geçmiş"
                                                >
                                                    📄
                                                </button>
                                                <button
                                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md transition active:scale-95"
                                                    title="Saksı Değiştir"
                                                >
                                                    ŞAŞIRTMA
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="lg:hidden space-y-4">
                        {Array.isArray(batches) && batches.map((batch) => (
                            <div key={batch.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 shadow-inner">
                                            {batch.stage === 'TEPSİ' ? '🛹' : batch.stage === 'KÜÇÜK_SAKSI' ? '🪴' : '🌲'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 tracking-tight text-sm">{batch.name}</h4>
                                            <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                                                {batch.lotId || `LOT-${batch.id.substring(0, 6)}`.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${batch.stage === 'TEPSİ' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        batch.stage === 'KÜÇÜK_SAKSI' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {batch.stage?.replace('_', ' ') || 'SAFHA BELİRSİZ'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Kaynak</p>
                                        <p className="text-[10px] font-bold text-emerald-600 truncate">
                                            {motherTrees.find(m => m.id === (batch.motherTreeId || batch.motherId))?.name || 'Ana Ağaç Bekleniyor'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Miktar / Tip</p>
                                        <p className="text-[10px] font-bold text-slate-700">{batch.quantity} | {batch.type}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-[9px] text-slate-400 font-medium">Giriş: {formatDate(batch.startDate, false)}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedBatch(batch); setIsHistoryOpen(true); }}
                                            className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm active:scale-90"
                                        >
                                            📄
                                        </button>
                                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition active:scale-95">
                                            ŞAŞIRTMA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!Array.isArray(batches) || (batches.length === 0)) && (
                        <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="text-4xl mb-4">🚜</div>
                            <p className="text-slate-400 font-medium italic">
                                {!Array.isArray(batches) ? 'Üretim verileri alınamadı.' : 'Henüz bir üretim partisi kaydı bulunmuyor.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* History / Traceability Modal */}
                {isHistoryOpen && selectedBatch && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
                            <div className="bg-slate-50 px-6 sm:px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">{selectedBatch.name} Şeceresi</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">LOT: {selectedBatch.lotId}</p>
                                </div>
                                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light">×</button>
                            </div>
                            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Kaynak Ana Ağaç</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{motherTrees.find(m => m.id === (selectedBatch.motherTreeId || selectedBatch.motherId))?.name || 'Bilinmiyor'}</p>
                                    </div>
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                        <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Uygulanan Reçete</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{recipes.find(r => r.id === selectedBatch.recipeId)?.name || 'Standart Bakım'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Zaman Tüneli (Lifecycle Logs)</p>
                                    <div className="border-l-2 border-slate-100 ml-4 space-y-6">
                                        {(selectedBatch.history || []).map((h: any, i: number) => (
                                            <div key={i} className="relative pl-8">
                                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm"></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {formatDate(h.date)}
                                                </p>
                                                <p className="text-sm font-bold text-slate-700">{h.action}</p>
                                                {h.note && <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">"{h.note}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 border-t border-slate-200 text-right">
                                <button onClick={() => setIsHistoryOpen(false)} className="w-full sm:w-auto bg-slate-800 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition active:scale-95">Kapat</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Batch Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Üretim Başlat (Dikim)</h3>
                                <button onClick={() => setIsModalOpen(false)} className="sm:hidden text-slate-400 text-2xl">×</button>
                            </div>
                            <form onSubmit={handleAddBatch} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kaynak Ana Ağaç</label>
                                    <select
                                        required
                                        value={newBatch.motherId}
                                        onChange={(e) => setNewBatch({ ...newBatch, motherId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                    >
                                        <option value="">Seçiniz...</option>
                                        {motherTrees.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Uygulanacak Reçete</label>
                                        <select
                                            required
                                            value={newBatch.recipeId}
                                            onChange={(e) => setNewBatch({ ...newBatch, recipeId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {recipes.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Üretim Tipi</label>
                                        <select
                                            required
                                            value={newBatch.type}
                                            onChange={(e) => setNewBatch({ ...newBatch, type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                        >
                                            <option value="Çelikleme">✂️ Çelikleme</option>
                                            <option value="Aşı">🌿 Aşılama</option>
                                            <option value="Tohum">🌱 Tohumdan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Parti Adı</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Örn: Ayvalık Zeytin 2024"
                                            value={newBatch.name}
                                            onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Miktar (Adet)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newBatch.quantity}
                                            onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50/50"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:flex-1 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition active:scale-95"
                                    >
                                        Üretimi Başlat
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
