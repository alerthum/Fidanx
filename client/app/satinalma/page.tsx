"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

export default function SatinalmaPage() {
    const [activeTab, setActiveTab] = useState<'mrp' | 'orders'>('mrp');
    const [stocks, setStocks] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [targetProduction, setTargetProduction] = useState<{ recipeId: string, quantity: number }[]>([]);
    const [analysis, setAnalysis] = useState<any[]>([]);

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        supplier: '',
        description: '',
        status: 'Bekliyor',
        items: [] as { materialId: string, amount: number, unitPrice: number }[]
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchData();
        fetchPurchases();
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

    const fetchPurchases = async () => {
        try {
            const res = await fetch(`${API_URL}/purchases?tenantId=demo-tenant`);
            if (res.ok) setPurchases(await res.json());
        } catch (err) { }
    };

    const calculateNeeds = () => {
        if (!recipes.length || !stocks.length) return;

        const needsMap: Record<string, { name: string, required: number, current: number }> = {};
        targetProduction.forEach(target => {
            const recipe = recipes.find(r => r.id === target.recipeId);
            if (recipe && recipe.items) {
                recipe.items.forEach((item: any) => {
                    const material = stocks.find(s => s.id === item.materialId);
                    if (material) {
                        const materialId = item.materialId;
                        if (!needsMap[materialId]) {
                            needsMap[materialId] = {
                                name: material.name,
                                required: 0,
                                current: Number(material.currentStock) || 0
                            };
                        }
                        needsMap[materialId].required += ((Number(item.amount) || 0) * (Number(target.quantity) || 0));
                    }
                });
            }
        });
        setAnalysis(Object.entries(needsMap).map(([id, data]) => ({ id, ...data })));
    };

    useEffect(() => {
        calculateNeeds();
    }, [targetProduction, stocks, recipes]);

    const createOrderFromAnalysis = () => {
        const missing = analysis.filter(i => i.current < i.required);
        if (missing.length === 0) return alert('Eksik malzeme yok.');

        setNewOrder({
            supplier: '',
            description: 'MRP Otomatik Sipariş',
            status: 'Taslak',
            items: missing.map(m => ({
                materialId: m.id,
                amount: Math.ceil(m.required - m.current),
                unitPrice: 0 // User fills this
            }))
        });
        setActiveTab('orders');
        setIsOrderModalOpen(true);
    };

    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newOrder,
                totalCost: newOrder.items.reduce((sum, item) => sum + (item.amount * item.unitPrice), 0)
            };
            const res = await fetch(`${API_URL}/purchases?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsOrderModalOpen(false);
                setNewOrder({ supplier: '', description: '', status: 'Bekliyor', items: [] });
                fetchPurchases();
            }
        } catch (err) { alert('Hata oluştu'); }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (status === 'Tamamlandı' && !confirm('Sipariş tamamlandığında stoklar artırılacaktır. Onaylıyor musunuz?')) return;
        try {
            const res = await fetch(`${API_URL}/purchases/${id}/status?tenantId=demo-tenant`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchPurchases();
                fetchData(); // Update stocks
            }
        } catch (err) { }
    };

    // Helper to add item row in modal
    const addItemToOrder = () => {
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { materialId: '', amount: 0, unitPrice: 0 }]
        });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 p-4 lg:p-6 sticky top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Satınalma Yönetimi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">MRP planlama ve tedarikçi sipariş takibi.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('mrp')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${activeTab === 'mrp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            İhtiyaç Analizi (MRP)
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Siparişler
                        </button>
                    </div>
                </header>

                <div className="p-4 lg:p-8">
                    {activeTab === 'mrp' && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
                                                        <button onClick={() => setTargetProduction(prev => prev.filter((_, i) => i !== idx))} className="text-rose-500 text-xs">❌</button>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="number"
                                                            value={target.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                const newArr = [...targetProduction];
                                                                newArr[idx].quantity = val;
                                                                setTargetProduction(newArr);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-mono font-bold"
                                                        />
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">ADET</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) setTargetProduction([...targetProduction, { recipeId: e.target.value, quantity: 1000 }]);
                                            }}
                                            className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm outline-none"
                                            value=""
                                        >
                                            <option value="">+ Hedef Ekle...</option>
                                            {recipes.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                                        </select>
                                    </div>
                                </section>
                            </div>

                            <div className="xl:col-span-2 space-y-6">
                                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📉 MALZEME İHTİYAÇ ANALİZİ</h3>
                                        <ExportButton title="MRP Raporu" tableId="mrp-table" />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left" id="mrp-table">
                                            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-4">Malzeme</th>
                                                    <th className="px-6 py-4 text-center">İhtiyaç</th>
                                                    <th className="px-6 py-4 text-center">Stok</th>
                                                    <th className="px-6 py-4 text-center">Fark</th>
                                                    <th className="px-6 py-4">Durum</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm">
                                                {analysis.map((item) => {
                                                    const diff = item.current - item.required;
                                                    const isLacking = diff < 0;
                                                    return (
                                                        <tr key={item.id} className="hover:bg-slate-50">
                                                            <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                                                            <td className="px-6 py-4 text-center font-mono">{item.required.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-center font-mono">{item.current.toLocaleString()}</td>
                                                            <td className={`px-6 py-4 text-center font-mono font-bold ${isLacking ? 'text-rose-500' : 'text-emerald-500'}`}>{diff.toLocaleString()}</td>
                                                            <td className="px-6 py-4">
                                                                {isLacking ?
                                                                    <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight border border-rose-100">Eksik</span>
                                                                    : <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight border border-emerald-100">Yeterli</span>
                                                                }
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {!analysis.length && <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic">Veri yok.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h4 className="text-lg font-bold">Eksik Malzemeleri Sipariş Et</h4>
                                        <p className="text-slate-400 text-xs mt-1">Eksik ürünler için otomatik sipariş taslağı oluşturun.</p>
                                    </div>
                                    <button
                                        onClick={createOrderFromAnalysis}
                                        disabled={!analysis.some(i => i.current < i.required)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sipariş Oluştur
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setNewOrder({ supplier: '', description: '', status: 'Bekliyor', items: [] });
                                        setIsOrderModalOpen(true);
                                    }}
                                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-md transition active:scale-95"
                                >
                                    + Yeni Sipariş
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {purchases.map(order => (
                                    <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                                        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{order.supplier}</h3>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                                                    {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${order.status === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    order.status === 'İptal' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <div className="space-y-2">
                                                {order.items?.slice(0, 3).map((item: any, i: number) => {
                                                    const mat = stocks.find(s => s.id === item.materialId);
                                                    return (
                                                        <div key={i} className="flex justify-between text-xs">
                                                            <span className="text-slate-600 truncate max-w-[60%]">{mat?.name || 'Bilinmeyen'}</span>
                                                            <span className="font-bold text-slate-800">x{item.amount}</span>
                                                        </div>
                                                    )
                                                })}
                                                {(order.items?.length || 0) > 3 && <p className="text-[10px] text-slate-400 italic">+{order.items.length - 3} kalem daha...</p>}
                                            </div>
                                            <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Toplam Tutar</span>
                                                <span className="font-bold text-slate-800">
                                                    {(order.totalCost || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                </span>
                                            </div>
                                        </div>
                                        {order.status !== 'Tamamlandı' && order.status !== 'İptal' && (
                                            <div className="bg-slate-50 p-3 flex gap-2">
                                                <button onClick={() => handleUpdateStatus(order.id, 'Tamamlandı')} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-700 transition">Teslim Al</button>
                                                <button onClick={() => handleUpdateStatus(order.id, 'İptal')} className="flex-1 bg-white border border-rose-200 text-rose-500 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-50 transition">İptal Et</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {purchases.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-400 text-sm italic bg-white rounded-3xl border border-slate-200">Kayıtlı sipariş yok.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Order Modal */}
                {isOrderModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Yeni Satınalma Siparişi</h3>
                            <form onSubmit={handleSaveOrder} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tedarikçi Firma</label>
                                        <input required type="text" className="w-full px-4 py-2 border rounded-xl text-sm" placeholder="Firma Adı" value={newOrder.supplier} onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Açıklama</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-xl text-sm" placeholder="Sipariş notu..." value={newOrder.description} onChange={e => setNewOrder({ ...newOrder, description: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Sipariş Kalemleri</label>
                                        <button type="button" onClick={addItemToOrder} className="text-emerald-600 text-[10px] font-bold uppercase hover:underline">+ Kalem Ekle</button>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 max-h-60 overflow-y-auto">
                                        {newOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <select required className="flex-1 px-3 py-2 border rounded-lg text-sm" value={item.materialId} onChange={e => {
                                                    const arr = [...newOrder.items]; arr[idx].materialId = e.target.value; setNewOrder({ ...newOrder, items: arr });
                                                }}>
                                                    <option value="">Malzeme Seç...</option>
                                                    {stocks.filter(s => s.type === 'RAW_MATERIAL' || s.type === 'PACKAGING').map(s => <option key={s.id} value={s.id}>{s.name} (Stok: {s.currentStock})</option>)}
                                                </select>
                                                <input required type="number" placeholder="Miktar" className="w-20 px-3 py-2 border rounded-lg text-sm" value={item.amount} onChange={e => {
                                                    const arr = [...newOrder.items]; arr[idx].amount = parseFloat(e.target.value); setNewOrder({ ...newOrder, items: arr });
                                                }} />
                                                <input required type="number" placeholder="Birim Fiyat" className="w-24 px-3 py-2 border rounded-lg text-sm" value={item.unitPrice} onChange={e => {
                                                    const arr = [...newOrder.items]; arr[idx].unitPrice = parseFloat(e.target.value); setNewOrder({ ...newOrder, items: arr });
                                                }} />
                                                <button type="button" onClick={() => setNewOrder({ ...newOrder, items: newOrder.items.filter((_, i) => i !== idx) })} className="text-rose-500 px-2">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
                                    <span className="font-bold text-slate-500 text-xs uppercase">Toplam</span>
                                    <span className="font-black text-xl text-slate-800">{newOrder.items.reduce((s, i) => s + (i.amount * i.unitPrice), 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsOrderModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200">İptal</button>
                                    <button type="submit" className="flex-1 py-3 text-white font-bold bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">Siparişi Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
