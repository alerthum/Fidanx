"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

interface Plant {
    id: string;
    name: string;
    category?: string;
    sku?: string;
    kod1?: string;
    kod2?: string;
    kod3?: string;
    kod4?: string;
    kod5?: string;
    type?: string;
    volume?: string;
    dimensions?: string;
    currentStock?: number;
    wholesalePrice?: number;
    retailPrice?: number;
    createdAt: string;
}

export default function StoklarPage() {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newPlant, setNewPlant] = useState({
        name: '',
        category: '',
        sku: '',
        kod1: '',
        kod2: '',
        kod3: '',
        kod4: '',
        kod5: '',
        type: 'CUTTING',
        volume: '',
        dimensions: '',
        currentStock: 0,
        wholesalePrice: 0,
        retailPrice: 0
    });

    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Sunucu hatası');
            }
            const data = await res.json();
            setPlants(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Stoklar yüklenemedi:', err);
            setError(err.message || 'Sunucuya bağlanılamadı.');
            setPlants([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPlant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/plants?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlant),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewPlant({ name: '', category: '', sku: '', kod1: '', kod2: '', kod3: '', kod4: '', kod5: '', type: 'CUTTING', volume: '', dimensions: '', currentStock: 0, wholesalePrice: 0, retailPrice: 0 });
                fetchPlants();
            }
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 lg:top-0 z-30 shadow-sm gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Stok Listesi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Tüm fidan türleri, ana ağaçlar ve grup kodları.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <ExportButton title="Mevcut Stok Durumu" tableId="stok-table" />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition active:scale-95"
                        >
                            + Yeni Stok Ekle
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4 text-rose-700">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="font-bold text-sm">Sunucu Bağlantı Sorunu</p>
                                    <p className="text-xs opacity-80">{error}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => fetchPlants()}
                                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700 transition active:scale-95 whitespace-nowrap"
                            >
                                Bağlantıyı Yenile
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]" id="stok-table">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Fidan Adı & Tip</th>
                                        <th className="px-6 py-4">Kategori / SKU</th>
                                        <th className="px-6 py-4 text-center">Mevcut Stok</th>
                                        <th className="px-6 py-4 text-center">Birim Fiyat (W/R)</th>
                                        <th className="px-6 py-4 text-center">Kod 1-5 (Grup)</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Array.isArray(plants) && plants.map((plant) => (
                                        <tr key={plant.id} className="hover:bg-slate-50 transition group text-sm">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {plant.type === 'MOTHER_TREE' ? '🌳' : plant.type === 'PACKAGING' ? '📦' : plant.type === 'RAW_MATERIAL' ? '🧱' : '🌱'}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-slate-700">{plant.name}</p>
                                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">
                                                            {plant.type === 'MOTHER_TREE' ? '• ANA AĞAÇ' : plant.type === 'PACKAGING' ? '• AMBALAJ / SAKSI' : plant.type === 'RAW_MATERIAL' ? '• HAMMADDE / GÜBRE' : '• ÜRETİM MATERYALİ'}
                                                        </p>
                                                        {(plant.volume || plant.dimensions) && (
                                                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                                                {plant.volume && `[${plant.volume}]`} {plant.dimensions && `(${plant.dimensions})`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-600">{plant.category || '-'}</p>
                                                <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{plant.sku || 'SKU-YOK'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-slate-700">{plant.currentStock !== undefined ? plant.currentStock : '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-1">
                                                    {[plant.kod1, plant.kod2, plant.kod3, plant.kod4, plant.kod5].map((k, i) => (
                                                        <span key={i} title={`Kod ${i + 1}`} className={`px-2 py-1 rounded text-[9px] font-bold ${k ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                                                            {k || '-'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => alert(`Barkod Basılıyor: ${plant.sku || plant.id}`)}
                                                        className="bg-slate-800 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all shadow-md active:scale-95"
                                                    >
                                                        BARKOD
                                                    </button>
                                                    <button className="bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all">DÜZENLE</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {(!Array.isArray(plants) || (plants.length === 0 && !isLoading)) && (
                            <div className="py-24 text-center space-y-4">
                                <div className="text-4xl text-slate-200">
                                    {error ? '📡' : '📭'}
                                </div>
                                <p className="text-slate-400 font-medium italic">
                                    {error ? 'Veriler sunucu hatası nedeniyle gösterilemiyor.' : 'Henüz stok kaydı bulunmuyor.'}
                                </p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="py-24 text-center">
                                <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 mt-4 font-bold text-[10px] uppercase tracking-widest">Veriler Yükleniyor...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Yeni Stok Kaydı</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl transition">×</button>
                            </div>

                            <form onSubmit={handleAddPlant} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fidan Adı</label>
                                    <input
                                        required
                                        type="text"
                                        value={newPlant.name}
                                        onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                        placeholder="Zeytin (Ayvalık)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Kategori</label>
                                    <input
                                        type="text"
                                        value={newPlant.category}
                                        onChange={(e) => setNewPlant({ ...newPlant, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Stok Kodu (SKU)</label>
                                    <input
                                        type="text"
                                        value={newPlant.sku}
                                        onChange={(e) => setNewPlant({ ...newPlant, sku: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fidan Tipi</label>
                                    <select
                                        value={newPlant.type}
                                        onChange={(e) => setNewPlant({ ...newPlant, type: e.target.value as 'CUTTING' | 'MOTHER_TREE' | 'GRAFT' | 'PACKAGING' | 'RAW_MATERIAL' })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                    >
                                        <option value="MOTHER_TREE">🌳 Ana Ağaç (Damlama/Çelik Kaynağı)</option>
                                        <option value="CUTTING">🌱 Üretim Materyali (Dal/Fide)</option>
                                        <option value="RAW_MATERIAL">🧱 Hammadde (Toprak/Gübre/Perlit)</option>
                                        <option value="PACKAGING">📦 Ambalaj / Saksı / Kap</option>
                                        <option value="GRAFT">🌿 Aşı Materyali</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Mevcut Stok Miktarı</label>
                                    <input
                                        type="number"
                                        value={newPlant.currentStock}
                                        onChange={(e) => setNewPlant({ ...newPlant, currentStock: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Toptan Fiyat (₺)</label>
                                        <input
                                            type="number"
                                            value={newPlant.wholesalePrice}
                                            onChange={(e) => setNewPlant({ ...newPlant, wholesalePrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Perakende Fiyat (₺)</label>
                                        <input
                                            type="number"
                                            value={newPlant.retailPrice}
                                            onChange={(e) => setNewPlant({ ...newPlant, retailPrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {newPlant.type === 'PACKAGING' && (
                                    <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-left-2 transition-all">
                                        <div>
                                            <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1.5">Hacim / Kapasite (Litre)</label>
                                            <input
                                                type="text"
                                                value={newPlant.volume}
                                                onChange={(e) => setNewPlant({ ...newPlant, volume: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                                                placeholder="Örn: 5L, 10L"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1.5">Ölçüler (Çap x Boy)</label>
                                            <input
                                                type="text"
                                                value={newPlant.dimensions}
                                                onChange={(e) => setNewPlant({ ...newPlant, dimensions: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                                                placeholder="Örn: 20x25 cm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-2 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Grup Kodları (ERP & Raporlama)</div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i}>
                                                <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Kod {i}</label>
                                                <input
                                                    type="text"
                                                    value={(newPlant as any)[`kod${i}`]}
                                                    onChange={(e) => setNewPlant({ ...newPlant, [`kod${i}`]: e.target.value })}
                                                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs text-center focus:border-emerald-500 transition"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2 flex gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition"
                                    >
                                        Stok Kartını Kaydedin
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
