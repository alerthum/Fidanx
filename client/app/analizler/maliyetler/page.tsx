"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

export default function MaliyetAnalizPage() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/finans/costing/analytics?tenantId=demo-tenant`);
            if (res.ok) setAnalytics(await res.json());
        } catch (err) { }
        finally { setIsLoading(false); }
    };

    const totalProductionCost = analytics.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const avgUnitCost = analytics.length > 0
        ? analytics.reduce((sum, item) => sum + (item.unitCost || 0), 0) / analytics.length
        : 0;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Maliyet Analizi</h1>
                        <p className="text-sm text-slate-500">Üretim partileri bazında birim maliyet hesapları.</p>
                    </div>
                    <ExportButton title="Maliyet Raporu" tableId="cost-table" />
                </header>

                <div className="p-8 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Toplam Üretim Maliyeti</h3>
                            <p className="text-2xl font-black text-slate-800">
                                {totalProductionCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ortalama Birim Maliyet</h3>
                            <p className="text-2xl font-black text-slate-800">
                                {avgUnitCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aktif Parti Sayısı</h3>
                            <p className="text-2xl font-black text-emerald-600">{analytics.length}</p>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Parti Bazlı Maliyetler</h3>
                        </div>
                        <table className="w-full text-left" id="cost-table">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Parti / Lot</th>
                                    <th className="px-6 py-4">Ürün Adı</th>
                                    <th className="px-6 py-4 text-center">Miktar</th>
                                    <th className="px-6 py-4 text-right">Hammadde T.</th>
                                    <th className="px-6 py-4 text-right">Toplam Mal.</th>
                                    <th className="px-6 py-4 text-right">Birim Mal.</th>
                                    <th className="px-6 py-4">Verimlilik</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {analytics.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{item.lotId || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{item.plantName || 'Bilinmiyor'}</td>
                                        <td className="px-6 py-4 text-center text-slate-600 font-mono">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-slate-500 font-mono">
                                            {item.materialCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700 font-mono">
                                            {item.totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600 font-mono">
                                            {item.unitCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Simple visual bar for relative cost/efficiency */}
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500"
                                                    style={{ width: `${Math.min(100, (item.unitCost / (avgUnitCost * 2)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {analytics.length === 0 && !isLoading && (
                                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 italic">Analiz edilecek veri bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
