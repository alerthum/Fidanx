"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SatinalmaPage() {
    const [stocks, setStocks] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [targetProduction, setTargetProduction] = useState<{ recipeId: string, quantity: number }[]>([]);
    const [analysis, setAnalysis] = useState<any[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sRes, rRes] = await Promise.all([
                fetch(`${API_URL}/plants?tenantId=demo-tenant`),
                fetch(`${API_URL}/recipes?tenantId=demo-tenant`)
            ]);
            setStocks(await sRes.json());
            setRecipes(await rRes.json());
        } catch (err) { }
    };

    const addTarget = (recipeId: string) => {
        setTargetProduction([...targetProduction, { recipeId, quantity: 1000 }]);
    };

    const updateTarget = (index: number, quantity: number) => {
        const newTargets = [...targetProduction];
        newTargets[index].quantity = quantity;
        setTargetProduction(newTargets);
    };

    const removeTarget = (index: number) => {
        setTargetProduction(targetProduction.filter((_, i) => i !== index));
    };

    useEffect(() => {
        calculateNeeds();
    }, [targetProduction, stocks, recipes]);

    const calculateNeeds = () => {
        const needsMap: Record<string, { name: string, required: number, current: number }> = {};

        targetProduction.forEach(target => {
            const recipe = recipes.find(r => r.id === target.recipeId);
            if (recipe && recipe.items) {
                recipe.items.forEach((item: any) => {
                    const material = stocks.find(s => s.id === item.materialId);
                    if (material) {
                        if (!needsMap[item.materialId]) {
                            needsMap[item.materialId] = {
                                name: material.name,
                                required: 0,
                                current: material.currentStock || 0
                            };
                        }
                        needsMap[item.materialId].required += (item.amount * target.quantity);
                    }
                });
            }
        });

        setAnalysis(Object.entries(needsMap).map(([id, data]) => ({ id, ...data })));
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 p-4 lg:p-6 lg:sticky lg:top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Satınalma & MRP Planlama</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Üretim hedeflerine göre malzeme ihtiyaç analizi.</p>
                    </div>
                </header>

                <div className="p-4 lg:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Üretim Hedefleri */}
                    <div className="xl:col-span-1 space-y-6">
                        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">🎯 ÜRETİM HEDEFLERİ</h3>
                            <div className="space-y-4">
                                {targetProduction.map((target, idx) => {
                                    const recipe = recipes.find(r => r.id === target.recipeId);
                                    return (
                                        <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-700">{recipe?.name}</span>
                                                <button onClick={() => removeTarget(idx)} className="text-rose-500 text-xs">❌ Kaldır</button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={target.quantity}
                                                    onChange={(e) => updateTarget(idx, parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-mono font-bold"
                                                    placeholder="Adet"
                                                />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">ADET</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <select
                                    onChange={(e) => e.target.value && addTarget(e.target.value)}
                                    className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm outline-none"
                                    value=""
                                >
                                    <option value="">+ Hedef Ekle...</option>
                                    {recipes.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </section>
                    </div>

                    {/* İhtiyaç Analizi */}
                    <div className="xl:col-span-2 space-y-6">
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📉 MALZEME İHTİYAÇ ANALİZİ (MRP)</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Malzeme Adı</th>
                                            <th className="px-6 py-4 text-center">Gereken Miktar</th>
                                            <th className="px-6 py-4 text-center">Mevcut Stok</th>
                                            <th className="px-6 py-4 text-center">Eksik / Fark</th>
                                            <th className="px-6 py-4">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {analysis.map((item) => {
                                            const diff = item.current - item.required;
                                            const isLacking = diff < 0;
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                                                    <td className="px-6 py-4 text-center font-mono text-xs">{item.required.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center font-mono text-xs">{item.current.toLocaleString()}</td>
                                                    <td className={`px-6 py-4 text-center font-mono text-xs font-bold ${isLacking ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {diff.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {isLacking ? (
                                                            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-rose-100">⚠️ SATINALMA GEREKLİ</span>
                                                        ) : (
                                                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100">✅ YETERLİ</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {analysis.length === 0 && (
                                            <tr><td colSpan={5} className="py-24 text-center text-slate-400 italic">Analiz için sol menüden üretim hedefi ekleyin.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-bold">Otomatik Sipariş Oluştur</h4>
                                <p className="text-slate-400 text-sm mt-1">Eksik olan tüm malzemeleri tedarikçilere RFQ (Teklif İsteği) olarak gönderin.</p>
                            </div>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-lg shadow-emerald-500/20 active:scale-95">
                                RFQ BAŞLAT
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
