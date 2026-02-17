"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SatinalmaPage() {
    // Tab state kept for potential future re-enable, but UI only shows Orders for now or hides MRP switcher
    const [activeTab, setActiveTab] = useState<'mrp' | 'orders'>('orders');
    const [analysis, setAnalysis] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stocks, setStocks] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]); // New: Suppliers/Customers
    const [locations, setLocations] = useState<string[]>(['Sera 1', 'Açık Alan', 'Sera 2', 'Depo']); // Locations

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    // New Order State
    const [newOrder, setNewOrder] = useState({
        supplier: '',
        supplierId: '', // Store ID
        description: '',
        status: 'Bekliyor',
        targetLocation: 'Sera 1', // Default location for the order items
        items: [] as any[] // { materialId, amount, unitPrice, name, unit }
    });

    // Item Selection State
    const [selectedCategory, setSelectedCategory] = useState<string>('TÜMÜ'); // Category Filter
    const [tempItem, setTempItem] = useState({
        materialId: '',
        amount: 0,
        unitPrice: 0
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Fetch Orders
            const resOrders = await fetch(`${API_URL}/purchases?tenantId=demo-tenant`);
            const dataOrders = await resOrders.json();
            setOrders(Array.isArray(dataOrders) ? dataOrders : []);

            // Fetch Stocks (for MRP and Item Selection)
            const resStocks = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            const dataStocks = await resStocks.json();
            setStocks(Array.isArray(dataStocks) ? dataStocks : []);

            // Fetch Customers (Suppliers)
            const resCustomers = await fetch(`${API_URL}/sales/customers?tenantId=demo-tenant`);
            const dataCustomers = await resCustomers.json();
            setCustomers(Array.isArray(dataCustomers) ? dataCustomers : []);

            // Fetch Settings for Locations
            const resSettings = await fetch(`${API_URL}/tenants/demo-tenant`);
            const dataSettings = await resSettings.json();
            if (dataSettings.settings?.locations && Array.isArray(dataSettings.settings.locations)) {
                setLocations(dataSettings.settings.locations);
            }

            // Helper: Simulate MRP Analysis (Keep for logic even if hidden)
            const mockAnalysis = Array.isArray(dataStocks) ? dataStocks.map((s: any) => ({
                id: s.id,
                name: s.name,
                current: s.currentStock || 0,
                required: (s.criticalStock || 0) * 1.5, // Mock requirement
                unit: s.unit || 'Adet'
            })) : [];
            setAnalysis(mockAnalysis);

        } catch (err) { }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // Find Supplier Name if ID is selected
        const supplierObj = customers.find(c => c.id === newOrder.supplierId);
        const supplierName = supplierObj ? supplierObj.name : newOrder.supplier;

        const payload = {
            ...newOrder,
            supplier: supplierName,
            status: 'Bekliyor', // Default status
            totalAmount: newOrder.items.reduce((sum, item) => sum + (item.amount * item.unitPrice), 0)
        };

        try {
            const res = await fetch(`${API_URL}/purchases?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setIsOrderModalOpen(false);
                setNewOrder({ supplier: '', supplierId: '', description: '', status: 'Bekliyor', targetLocation: locations[0] || 'Sera 1', items: [] });
                fetchInitialData();
            }
        } catch (err) { }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        if (status === 'Tamamlandı' && !confirm('Sipariş tamamlandığında stoklar artırılacaktır. Emin misiniz?')) return;

        try {
            const res = await fetch(`${API_URL}/purchases/${id}/status?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchInitialData();
        } catch (err) { }
    };

    const addItemToOrder = () => {
        if (!tempItem.materialId || tempItem.amount <= 0) return alert('Lütfen malzeme ve miktar seçin.');

        const material = stocks.find(s => s.id === tempItem.materialId);
        const newItem = {
            ...tempItem,
            name: material?.name || 'Bilinmiyor',
            unit: material?.unit || 'Adet'
        };

        setNewOrder({ ...newOrder, items: [...newOrder.items, newItem] });
        setTempItem({ materialId: '', amount: 0, unitPrice: 0 });
        setIsItemModalOpen(false);
    };

    // Filter stocks based on selection
    const filteredStocks = selectedCategory === 'TÜMÜ'
        ? stocks
        : stocks.filter(s => s.category === selectedCategory || s.type === selectedCategory);

    // Get Unique Categories for Filter
    const categories = ['TÜMÜ', ...Array.from(new Set(stocks.map(s => s.category || s.type).filter(Boolean)))];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-30">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Satınalma</h1>
                            <p className="text-sm text-slate-500">Alış faturaları ve tedarikçi yönetimi.</p>
                        </div>
                        <button
                            onClick={() => {
                                setNewOrder({ supplier: '', supplierId: '', description: '', status: 'Bekliyor', targetLocation: locations[0] || 'Sera 1', items: [] });
                                setIsOrderModalOpen(true);
                            }}
                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition active:scale-95"
                        >
                            + Yeni Alış Faturası
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8">
                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Tedarikçi / Cari</th>
                                        <th className="px-6 py-4">Tarih</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4">İçerik</th>
                                        <th className="px-6 py-4 text-right">Toplam Tutar</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-bold text-slate-700">{order.supplier}</td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-black border ${order.status === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    order.status === 'İptal' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex flex-col gap-1">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <span key={idx} className="text-xs">
                                                            {item.amount} {item.unit || 'Adet'} x {item.name || 'Ürün'}
                                                        </span>
                                                    ))}
                                                    {(!order.items || order.items.length === 0) && <span className="text-xs italic text-slate-400">Kalem yok</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                                                ₺{order.totalAmount ? order.totalAmount.toLocaleString() : '0'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setNewOrder({
                                                                supplier: order.supplier,
                                                                supplierId: order.supplierId || '',
                                                                description: order.description || '',
                                                                status: order.status,
                                                                targetLocation: order.targetLocation || 'Sera 1',
                                                                items: order.items || []
                                                            });
                                                            setIsOrderModalOpen(true);
                                                        }}
                                                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-100 transition"
                                                    >
                                                        Düzenle
                                                    </button>

                                                    {order.status === 'Bekliyor' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'Tamamlandı')}
                                                                className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-100 transition"
                                                            >
                                                                Teslim Al
                                                            </button>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'İptal')}
                                                                className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-100 transition"
                                                            >
                                                                İptal
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Henüz kayıtlı fatura bulunmuyor.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Main Order Modal */}
                {isOrderModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {newOrder.status !== 'Bekliyor' ? 'Fatura Detayı' : 'Yeni Alış Faturası'}
                                </h3>
                                <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                            </div>

                            <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tedarikçi (Cari)</label>
                                        <select
                                            value={newOrder.supplierId}
                                            onChange={(e) => {
                                                setNewOrder({ ...newOrder, supplierId: e.target.value });
                                            }}
                                            disabled={newOrder.status !== 'Bekliyor'}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm disabled:bg-slate-50"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Açıklama / Fatura No</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: MAT-2024001"
                                            value={newOrder.description}
                                            onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
                                            disabled={newOrder.status !== 'Bekliyor'}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm disabled:bg-slate-50"
                                        />
                                    </div>

                                    {/* Location Selection */}
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Teslim Alınacak Konum (Depo/Sera)</label>
                                        <select
                                            value={newOrder.targetLocation}
                                            onChange={(e) => setNewOrder({ ...newOrder, targetLocation: e.target.value })}
                                            disabled={newOrder.status !== 'Bekliyor'}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm disabled:bg-slate-50"
                                        >
                                            {locations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-slate-400 mt-1">Bu faturadaki ürünler teslim alındığında bu konuma eklenecektir.</p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fatura Kalemleri</span>
                                        {newOrder.status === 'Bekliyor' && (
                                            <button
                                                type="button"
                                                onClick={() => setIsItemModalOpen(true)}
                                                className="text-emerald-600 text-xs font-bold hover:text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg transition"
                                            >
                                                + Ürün/Hammadde Ekle
                                            </button>
                                        )}
                                    </div>

                                    {newOrder.items.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                            Kalem eklenmedi.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {newOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                                                        <p className="text-xs text-slate-400">{item.amount} {item.unit} x ₺{item.unitPrice}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono font-bold text-slate-800">₺{(item.amount * item.unitPrice).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                                <span className="font-bold text-slate-500">TOPLAM</span>
                                                <span className="font-mono font-black text-xl text-emerald-600">
                                                    ₺{newOrder.items.reduce((sum, item) => sum + (item.amount * item.unitPrice), 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-4">
                                <button onClick={() => setIsOrderModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition">
                                    {newOrder.status === 'Bekliyor' ? 'İptal' : 'Kapat'}
                                </button>
                                {newOrder.status === 'Bekliyor' && (
                                    <button onClick={handleCreateOrder} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition">Kaydet</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub Modal: Add Item */}
                {isItemModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-[60]">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
                            <h4 className="font-bold text-slate-800 mb-4">Ürün Seçimi</h4>

                            <div className="space-y-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ürün Grubu Filtresi</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${selectedCategory === cat
                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stok Kartı / Malzeme</label>
                                    <select
                                        value={tempItem.materialId}
                                        onChange={(e) => setTempItem({ ...tempItem, materialId: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                                        size={5} // Show multiple items
                                    >
                                        {filteredStocks.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} (Stok: {s.currentStock || 0} {s.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Miktar</label>
                                        <input
                                            type="number"
                                            value={tempItem.amount}
                                            onChange={(e) => setTempItem({ ...tempItem, amount: Number(e.target.value) })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Birim Fiyat (TL)</label>
                                        <input
                                            type="number"
                                            value={tempItem.unitPrice}
                                            onChange={(e) => setTempItem({ ...tempItem, unitPrice: Number(e.target.value) })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setIsItemModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200">Vazgeç</button>
                                    <button onClick={addItemToOrder} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shadow-md">Listeye Ekle</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
