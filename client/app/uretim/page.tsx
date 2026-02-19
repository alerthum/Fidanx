"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function UretimPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [motherTrees, setMotherTrees] = useState<any[]>([]);
    const [locations, setLocations] = useState<string[]>([]); // Strings from settings

    // UI States
    const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
    const [isTransplantModalOpen, setIsTransplantModalOpen] = useState(false);
    const [isCostModalOpen, setIsCostModalOpen] = useState(false); // Cost History Modal
    const [selectedBatch, setSelectedBatch] = useState<any>(null);

    // Form States
    const [newBatchForm, setNewBatchForm] = useState({
        motherId: '',
        name: '',
        quantity: 0,
        type: 'Çelikleme',
        locationId: '',
        subLocation: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    const [transplantForm, setTransplantForm] = useState({
        moveQuantity: 0,
        targetLocationId: '',
        targetSubLocation: '',
        targetStage: 'KÜÇÜK_SAKSI'
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    const stages = [
        { id: 'TEPSİ', name: 'Tepsi / Viyol' },
        { id: 'KÜÇÜK_SAKSI', name: 'Küçük Saksı' },
        { id: 'BÜYÜK_SAKSI', name: 'Büyük Saksı' },
        { id: 'SATIŞA_HAZIR', name: 'Satışa Hazır' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Batches
            const res = await fetch(`${API_URL}/production?tenantId=demo-tenant`);
            const data = await res.json();
            setBatches(Array.isArray(data) ? data : []);

            // Fetch Mother Trees
            const plantRes = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            const plants = await plantRes.json();
            setMotherTrees(Array.isArray(plants) ? plants.filter((p: any) => p.type === 'MOTHER_TREE') : []);

            // Fetch Settings for Locations
            const settingsRes = await fetch(`${API_URL}/tenants/demo-tenant`);
            const settingsData = await settingsRes.json();
            if (settingsData.settings?.locations) setLocations(settingsData.settings.locations);
        } catch (err) { console.error(err); }
    };

    const handleCreateBatch = async () => {
        const datePart = newBatchForm.startDate.replace(/-/g, '').substring(2);
        const newLotId = `${datePart}-${newBatchForm.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100)}`;

        const payload = {
            lotId: newLotId,
            ...newBatchForm,
            station: 'TEPSİ',
            stage: 'TEPSİ',
            location: newBatchForm.locationId,
            motherTreeName: motherTrees.find(m => m.id === newBatchForm.motherId)?.name || 'Bilinmiyor'
        };

        try {
            const res = await fetch(`${API_URL}/production?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsNewBatchModalOpen(false);
                fetchData();
            } else {
                alert('Hata oluştu.');
            }
        } catch (err) { alert('Hata.'); }
    };

    const openTransplantModal = (batch: any) => {
        setSelectedBatch(batch);
        setTransplantForm({
            moveQuantity: batch.quantity,
            targetLocationId: '',
            targetSubLocation: '',
            targetStage: 'KÜÇÜK_SAKSI'
        });
        setIsTransplantModalOpen(true);
    };

    const openCostModal = (batch: any) => {
        setSelectedBatch(batch);
        setIsCostModalOpen(true);
    };

    const handleTransplant = async () => {
        if (!selectedBatch) return;
        // Backend implementation pending for split/move.
        // For now using simple update for demo/MVP if backend supports partial moves (it supports transferBatch but not splitting yet in the code I wrote).
        // Since backend logic changes were focused on Cost, I will use transferBatch which moves WHOLE batch.
        // If user wants split, we need backend support. I will assume full move for now as backend transferBatch moves the doc.

        try {
            await fetch(`${API_URL}/production/${selectedBatch.id}/transfer?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetLocation: transplantForm.targetLocationId })
            });
            // Also update stage
            await fetch(`${API_URL}/production/${selectedBatch.id}/stage?tenantId=demo-tenant`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: transplantForm.targetStage })
            });

            setIsTransplantModalOpen(false);
            fetchData();
        } catch (err) { alert('Transfer hatası'); }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Üretim & Parti Takibi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Viyol, saksı ve arazi yerleşimlerinin parti (lot) bazlı yönetimi ve maliyet takibi.</p>
                    </div>
                    <button
                        onClick={() => setIsNewBatchModalOpen(true)}
                        className="bg-emerald-600 text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition w-full sm:w-auto"
                    >
                        + Yeni Parti Başlat
                    </button>
                </header>

                <div className="p-4 lg:p-8">
                    <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Parti / Lot No</th>
                                        <th className="px-6 py-4">Ürün & Kaynak</th>
                                        <th className="px-6 py-4">Konum</th>
                                        <th className="px-6 py-4">Miktar</th>
                                        <th className="px-6 py-4">Maliyet (Birim)</th>
                                        <th className="px-6 py-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {Array.isArray(batches) && batches.map(batch => {
                                        const totalCost = batch.accumulatedCost || 0;
                                        const unitCost = batch.quantity > 0 ? totalCost / batch.quantity : 0;

                                        return (
                                            <tr key={batch.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{batch.stage?.includes('TEPSİ') ? '🌱' : '🪴'}</span>
                                                        <div>
                                                            <p className="font-mono font-bold text-emerald-700">{batch.lotId}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{batch.startDate ? new Date(batch.startDate).toLocaleDateString('tr-TR') : '-'} Giriş</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{batch.name || batch.plantName}</p>
                                                    <p className="text-[10px] text-slate-500">Anaç: {batch.motherTreeName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 mb-1">
                                                        {batch.location}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                                        <span>📦</span>
                                                        {batch.subLocation || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                                    {batch.quantity} Adet
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{unitCost.toFixed(2)} ₺</span>
                                                        <button onClick={() => openCostModal(batch)} className="text-[10px] text-emerald-600 hover:underline text-left font-bold">
                                                            Detay Gör (Top: {totalCost.toFixed(2)} ₺)
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => openTransplantModal(batch)}
                                                        className="bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                                                    >
                                                        ⇄ Taşı
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {batches.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-slate-400 italic">Kayıt bulunamadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {Array.isArray(batches) && batches.map(batch => {
                                const totalCost = batch.accumulatedCost || 0;
                                const unitCost = batch.quantity > 0 ? totalCost / batch.quantity : 0;

                                return (
                                    <div key={batch.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl mt-0.5">{batch.stage?.includes('TEPSİ') ? '🌱' : '🪴'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-bold text-emerald-700 text-sm">{batch.lotId}</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{batch.location}</span>
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm">{batch.name || batch.plantName}</p>
                                                <p className="text-[11px] text-slate-400">Anaç: {batch.motherTreeName}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-700">{batch.quantity} Adet</span>
                                                        <button onClick={() => openCostModal(batch)} className="text-[11px] text-emerald-600 font-bold">
                                                            {unitCost.toFixed(2)} ₺/ad
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => openTransplantModal(batch)}
                                                        className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95"
                                                    >
                                                        ⇄ Taşı
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {batches.length === 0 && (
                                <div className="text-center py-12 text-slate-400 italic">Kayıt bulunamadı.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* New Batch Modal */}
                {isNewBatchModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[95vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-6">Yeni Üretim Partisi</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Parti Adı / Ürün</label>
                                    <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" value={newBatchForm.name} onChange={e => setNewBatchForm({ ...newBatchForm, name: e.target.value })} placeholder="Örn: Mavi Ladin" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Kaynak Anaç</label>
                                    <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" value={newBatchForm.motherId} onChange={e => setNewBatchForm({ ...newBatchForm, motherId: e.target.value })}>
                                        <option value="">Seçiniz...</option>
                                        {motherTrees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Miktar (Adet)</label>
                                        <input type="number" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" value={newBatchForm.quantity} onChange={e => setNewBatchForm({ ...newBatchForm, quantity: parseInt(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Giriş Tarihi</label>
                                        <input type="date" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" value={newBatchForm.startDate} onChange={e => setNewBatchForm({ ...newBatchForm, startDate: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Başlangıç Konumu & Kap</label>
                                    <div className="flex gap-2">
                                        <select className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" value={newBatchForm.locationId} onChange={e => setNewBatchForm({ ...newBatchForm, locationId: e.target.value })}>
                                            <option value="">Seçiniz...</option>
                                            {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                        <input className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" placeholder="Örn: Masa 3, Kasa A..." value={newBatchForm.subLocation} onChange={e => setNewBatchForm({ ...newBatchForm, subLocation: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button onClick={() => setIsNewBatchModalOpen(false)} className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">İptal</button>
                                    <button onClick={handleCreateBatch} className="py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Kaydet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transplant Modal */}
                {isTransplantModalOpen && selectedBatch && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[95vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Transfer & Taşıma</h3>
                            <div className="space-y-4">
                                <p className="text-sm">Seçilen Parti: <b>{selectedBatch.lotId}</b></p>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Hedef Konum</label>
                                    <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" value={transplantForm.targetLocationId} onChange={e => setTransplantForm({ ...transplantForm, targetLocationId: e.target.value })}>
                                        <option value="">Seçiniz</option>
                                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Yeni Safha</label>
                                    <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none" value={transplantForm.targetStage} onChange={e => setTransplantForm({ ...transplantForm, targetStage: e.target.value })}>
                                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button onClick={() => setIsTransplantModalOpen(false)} className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">İptal</button>
                                    <button onClick={handleTransplant} className="py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Onayla</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cost History Modal */}
                {isCostModalOpen && selectedBatch && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[95vh] sm:max-h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Maliyet Geçmişi</h3>
                                    <p className="text-sm text-slate-500 font-mono">{selectedBatch.lotId}</p>
                                </div>
                                <button onClick={() => setIsCostModalOpen(false)} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-800 uppercase">Toplam Maliyet</p>
                                    <p className="text-2xl font-black text-emerald-600">{Number(selectedBatch.accumulatedCost || 0).toFixed(2)} ₺</p>
                                </div>
                                <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-800 uppercase">Birim Maliyet</p>
                                    <p className="text-2xl font-black text-blue-600">
                                        {(selectedBatch.quantity > 0 ? (selectedBatch.accumulatedCost || 0) / selectedBatch.quantity : 0).toFixed(2)} ₺
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto border rounded-xl border-slate-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Tarih</th>
                                            <th className="px-4 py-3">Açıklama</th>
                                            <th className="px-4 py-3 text-right">Tutar (+Partiye)</th>
                                            <th className="px-4 py-3 text-right">Birim Etkisi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(selectedBatch.costHistory || []).map((h: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-500">{new Date(h.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium text-slate-700">{h.description}</td>
                                                <td className="px-4 py-3 text-right font-bold text-emerald-600">+{Number(h.amount).toFixed(2)} ₺</td>
                                                <td className="px-4 py-3 text-right text-slate-400 text-xs">+{Number(h.unitVal || 0).toFixed(2)} ₺</td>
                                            </tr>
                                        ))}
                                        {(!selectedBatch.costHistory || selectedBatch.costHistory.length === 0) && (
                                            <tr><td colSpan={4} className="p-4 text-center text-slate-400 italic">Henüz maliyet kaydı yok.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
