"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function MaliyetAnalizPage() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/finans/costing/analytics?tenantId=demo-tenant`);
            const data = await res.json();
            setAnalytics(data);
        } catch (err) { } finally {
            setIsLoading(false);
        }
    };

    const totalPortfolioCost = analytics.reduce((acc, curr) => acc + curr.totalCost, 0);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 p-4 lg:p-6 lg:sticky lg:top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Birim Maliyet Analizi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Üretim partileri bazında karlılık ve maliyet dökümü.</p>
                    </div>
                </header>

                <div className="p-4 lg:p-8 space-y-8">
                    {/* Özet Kartlar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TOPLAM ÜRETİM DEĞERİ (MALİYET BAZLI)</p>
                            <p className="text-3xl font-black font-mono text-emerald-400">₺{totalPortfolioCost.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ORTALAMA BİRİM MALİYET</p>
                            <p className="text-3xl font-black font-mono text-slate-800">
                                ₺{(analytics.reduce((acc, curr) => acc + curr.unitCost, 0) / (analytics.length || 1)).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TOPLAM PARTİ SAYISI</p>
                            <p className="text-3xl font-black font-mono text-slate-800">{analytics.length}</p>
                        </div>
                    </div>

                    {/* Detaylı Liste */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PARTİ BAZLI MALİYET DÖKÜMÜ</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Parti (LOT) / Ürün</th>
                                        <th className="px-6 py-4 text-center">Hammadde (₺)</th>
                                        <th className="px-6 py-4 text-center">İşçilik/Gider (₺)</th>
                                        <th className="px-6 py-4 text-center">Toplam Maliyet</th>
                                        <th className="px-6 py-4 text-center">Adet</th>
                                        <th className="px-6 py-4 text-right">Birim Maliyet</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic sm:not-italic">
                                    {analytics.map((item) => (
                                        <tr key={item.batchId} className="hover:bg-slate-50 transition group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{item.lotId}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{item.plantName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                                                {item.materialCost.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                                                {item.allocatedExpenses.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-sm font-bold text-slate-800">
                                                ₺{item.totalCost.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-400">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl inline-block border border-emerald-100">
                                                    <span className="font-black font-mono text-sm">₺{item.unitCost.toFixed(2)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {analytics.length === 0 && !isLoading && (
                                        <tr><td colSpan={6} className="py-24 text-center text-slate-400">Henüz maliyet verisi hesaplanamadı.</td></tr>
                                    )}
                                    {isLoading && (
                                        <tr><td colSpan={6} className="py-24 text-center text-slate-400 animate-pulse">Veriler hesaplanıyor...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Grafik / İpucu */}
                    <div className="p-8 bg-emerald-900 rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                        <div className="text-5xl">💡</div>
                        <div>
                            <h4 className="text-xl font-bold">Maliyet Optimizasyonu İpucu</h4>
                            <p className="text-emerald-100/70 text-sm mt-2 leading-relaxed">
                                Birim maliyeti yüksek olan partilerde hammadde kullanımını tekrar gözden geçirin.
                                Özellikle Genel Giderlerin (elektrik, kira, bakım) daha fazla partiye dağıtılması birim maliyeti düşürecektir.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
