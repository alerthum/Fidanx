"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function HareketlerPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [locations, setLocations] = useState<string[]>(['Sera 1', 'Sera 2', 'Açık Alan', 'Depo']);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [transferData, setTransferData] = useState({ targetLocation: 'Sera 1', note: '' });
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([fetchBatches(), fetchSettings()]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBatches = async () => {
        const res = await fetch(`${API_URL}/production/batches?tenantId=demo-tenant`);
        if (res.ok) {
            setBatches(await res.json());
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/tenants/demo-tenant`);
            const data = await res.json();
            if (data.settings?.locations) setLocations(data.settings.locations);
        } catch (err) { }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBatch) return;

        try {
            const res = await fetch(`${API_URL}/production/batches/${selectedBatch.id}/transfer?tenantId=demo-tenant`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transferData)
            });

            if (res.ok) {
                setIsTransferModalOpen(false);
                setSelectedBatch(null);
                setTransferData({ targetLocation: locations[0] || 'Sera 1', note: '' });
                fetchBatches();
            } else {
                alert('Transfer başarısız.');
            }
        } catch (err) {
            alert('Sunucu hatası.');
        }
    };

    const openTransferModal = (batch: any) => {
        setSelectedBatch(batch);
        setTransferData({ targetLocation: locations.filter(l => l !== batch.location)[0] || locations[0], note: '' });
        setIsTransferModalOpen(true);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Operasyon & Hareket</h1>
                        <p className="text-sm text-slate-500">Üretim partilerinin konum transferleri ve hareket kayıtları.</p>
                    </div>
                </header>

                <div className="p-8">
                    {/* Batches List regarding Location */}
                    <div className="space-y-6">
                        {locations.map(location => {
                            const locationBatches = batches.filter(b => (b.location || 'Depo') === location);
                            if (locationBatches.length === 0) return null;

                            return (
                                <div key={location} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📍</span>
                                            <h3 className="font-bold text-slate-700">{location}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">{locationBatches.length} Parti</span>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {locationBatches.map(batch => (
                                            <div key={batch.id} className="p-6 hover:bg-slate-50/50 transition flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">{batch.lotId}</span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{batch.stage}</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-lg">{batch.plantName || 'İsimsiz Ürün'}</h4>
                                                    <p className="text-sm text-slate-500">{batch.quantity} Adet • {new Date(batch.startDate).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                                <button
                                                    onClick={() => openTransferModal(batch)}
                                                    className="bg-amber-100 text-amber-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-amber-200 hover:bg-amber-200 hover:border-amber-300 transition shadow-sm active:scale-95 flex items-center gap-2"
                                                >
                                                    🚚 Transfer Et
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {batches.filter(b => !b.location).length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                                    <h3 className="font-bold text-slate-400">Konumu Belirsiz / Depo</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {batches.filter(b => !b.location).map(batch => (
                                        <div key={batch.id} className="p-6 hover:bg-slate-50/50 transition flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">{batch.lotId}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{batch.stage}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-lg">{batch.plantName || 'İsimsiz Ürün'}</h4>
                                                <p className="text-sm text-slate-500">{batch.quantity} Adet • {new Date(batch.startDate).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                            <button
                                                onClick={() => openTransferModal(batch)}
                                                className="bg-amber-100 text-amber-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-amber-200 hover:bg-amber-200 hover:border-amber-300 transition shadow-sm active:scale-95 flex items-center gap-2"
                                            >
                                                🚚 Transfer Et
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {batches.length === 0 && !isLoading && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                                <div className="text-6xl mb-4 opacity-50">🚚</div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Hareket Kaydı Yok</h3>
                                <p className="text-slate-500">Henüz transfer edilecek bir üretim partisi bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transfer Modal */}
                {isTransferModalOpen && selectedBatch && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Konum Transferi</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                <span className="font-bold text-slate-700">{selectedBatch.lotId}</span> numaralı parti <span className="font-bold text-slate-700">{selectedBatch.location || 'Depo'}</span> konumundan taşınıyor.
                            </p>

                            <form onSubmit={handleTransfer} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Hedef Konum</label>
                                    <select
                                        value={transferData.targetLocation}
                                        onChange={(e) => setTransferData({ ...transferData, targetLocation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm bg-slate-50/50"
                                    >
                                        {locations.filter(l => l !== selectedBatch.location).map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Transfer Notu (Opsiyonel)</label>
                                    <textarea
                                        value={transferData.note}
                                        onChange={(e) => setTransferData({ ...transferData, note: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm bg-slate-50/50 resize-none h-24"
                                        placeholder="Örn: Güneşe çıkarıldı..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsTransferModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition uppercase text-xs tracking-widest"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-black shadow-lg shadow-amber-200 hover:bg-amber-600 transition active:scale-95 uppercase text-xs tracking-widest"
                                    >
                                        Transferi Onayla
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
