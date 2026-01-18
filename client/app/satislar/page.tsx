"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SatislarPage() {
    const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);
    const [activeTab, setActiveTab] = useState<'NEW_ORDER' | 'ORDERS' | 'CUSTOMERS'>('ORDERS');
    const [customers, setCustomers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stocks, setStocks] = useState<any[]>([]);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '', note: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    React.useEffect(() => {
        fetchCustomers();
        fetchOrders();
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const res = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            const data = await res.json();
            // Sadece üretilebilir veya satılabilir olanları al (Ana ağaç hariç diyebiliriz ama hepsi gelsin şimdilik)
            setStocks(data);
        } catch (err) { }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${API_URL}/sales/customers?tenantId=demo-tenant`);
            const data = await res.json();
            setCustomers(data);
        } catch (err) { }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/sales/orders?tenantId=demo-tenant`);
            const data = await res.json();
            setOrders(data);
        } catch (err) { }
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/sales/customers?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer),
            });
            if (res.ok) {
                setIsCustomerModalOpen(false);
                setNewCustomer({ name: '', phone: '', email: '', address: '', note: '' });
                fetchCustomers();
            }
        } catch (err) { }
    };

    const addToCart = (product: any) => {
        const existing = cart.find(c => c.id === product.id);
        if (existing) {
            setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { id: product.id, name: product.name, qty: 1, price: product.wholesalePrice || 0 }]);
        }
        setIsProductModalOpen(false);
    };

    const handleCompleteOrder = async () => {
        if (!selectedCustomerId) return alert('Lütfen müşteri seçin.');
        if (cart.length === 0) return alert('Sepet boş.');

        const customer = customers.find(c => c.id === selectedCustomerId);
        const totalAmount = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);

        const payload = {
            customerId: selectedCustomerId,
            customerName: customer?.name,
            items: cart,
            totalAmount,
            status: 'PENDING'
        };

        try {
            const res = await fetch(`${API_URL}/sales/orders?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                alert('Sipariş başarıyla oluşturuldu.');
                setCart([]);
                setSelectedCustomerId('');
                setActiveTab('ORDERS');
                fetchOrders();
            }
        } catch (err) { }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 p-4 lg:p-6 lg:sticky lg:top-0 z-30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Satış & CRM</h1>
                            <p className="text-xs lg:text-sm text-slate-500">Müşteri siparişleri ve ilişkileri yönetimi.</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition"
                            >
                                + Yeni Müşteri
                            </button>
                            <button
                                onClick={() => setActiveTab('NEW_ORDER')}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition"
                            >
                                + Yeni Sipariş
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-8 border-b border-slate-100">
                        {['Siparişler', 'Müşteriler', 'Yeni Sipariş'].map((tab, idx) => {
                            const val = ['ORDERS', 'CUSTOMERS', 'NEW_ORDER'][idx] as any;
                            return (
                                <button
                                    key={val}
                                    onClick={() => setActiveTab(val)}
                                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === val ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                    {activeTab === val && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                                </button>
                            );
                        })}
                    </div>
                </header>

                <div className="p-4 lg:p-8">
                    {activeTab === 'NEW_ORDER' && (
                        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Müşteri Seçimi</label>
                                    <select
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700"
                                    >
                                        <option value="">Bir Müşteri Seçin...</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Tel Yok'})</option>
                                        ))}
                                    </select>
                                </section>

                                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sepetteki Ürünler</label>
                                        <span className="text-xs font-medium text-slate-400">{cart.length} Ürün</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {cart.length === 0 ? (
                                            <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">Henüz ürün eklenmedi.</div>
                                        ) : (
                                            cart.map((item) => (
                                                <div key={item.id} className="py-4 flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">F</div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{item.name}</p>
                                                            <p className="text-sm text-slate-500">{item.qty} Adet x ₺{item.price}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-slate-900 font-mono">₺{item.qty * item.price}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                <section className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsProductModalOpen(true)}
                                        className="h-28 bg-white border-2 border-dashed border-emerald-200 text-emerald-700 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
                                    >
                                        <span className="text-3xl font-bold group-hover:scale-110 transition-transform">+</span>
                                        <span className="font-bold text-xs uppercase tracking-wide">Ürün Ekle</span>
                                    </button>
                                    <button className="h-28 bg-white border-2 border-dashed border-emerald-200 text-emerald-700 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                                        <span className="text-3xl font-bold group-hover:scale-110 transition-transform">📷</span>
                                        <span className="font-bold text-xs uppercase tracking-wide">QR Tarat</span>
                                    </button>
                                </section>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-48 space-y-8">
                                    <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Sipariş Özeti</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Ara Toplam</span>
                                            <span className="font-mono">₺{cart.reduce((acc, item) => acc + (item.qty * item.price), 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>KDV (%20)</span>
                                            <span className="font-mono">₺{(cart.reduce((acc, item) => acc + (item.qty * item.price), 0) * 0.2).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold pt-4 border-t border-slate-800">
                                            <span>Toplam</span>
                                            <span className="text-emerald-400 font-mono">₺{(cart.reduce((acc, item) => acc + (item.qty * item.price), 0) * 1.2).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCompleteOrder}
                                        className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        Satışı Tamamla
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ORDERS' && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left font-bold text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Müşteri</th>
                                        <th className="px-6 py-4">Tarih</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map(o => (
                                        <tr key={o.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-slate-700">{o.customerName || 'Belirtilmemiş'}</td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    o.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {o.status === 'PENDING' ? 'BEKLEMEDE' : o.status === 'COMPLETED' ? 'TAMAMLANDI' : 'İPTAL'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-900 font-mono">₺{o.totalAmount || 0}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Kayıtlı sipariş bulunmuyor.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'CUSTOMERS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customers.map(c => (
                                <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-emerald-100 transition-colors">👤</div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{c.name}</h3>
                                            <p className="text-xs text-slate-400">{c.phone || 'Telefon yok'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border-t border-slate-50 pt-4">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Adres & Not</p>
                                        <p className="text-xs text-slate-400 italic">{c.address || 'Adres bilgisi girilmemiş.'}</p>
                                        {c.note && <p className="text-xs text-blue-500 bg-blue-50 p-2 rounded-lg">{c.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Customer Modal */}
                {isCustomerModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">
                            <h3 className="text-xl font-bold mb-6">Yeni Müşteri Kaydı</h3>
                            <form onSubmit={handleCreateCustomer} className="space-y-4">
                                <input required placeholder="Müşteri / Firma Adı" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-emerald-500 text-sm" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Telefon" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-emerald-500 text-sm" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                                    <input placeholder="E-Posta" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-emerald-500 text-sm" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                                </div>
                                <textarea placeholder="Adres" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:border-emerald-500 text-sm h-24" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-4 font-black text-xs uppercase bg-slate-100 rounded-xl text-slate-500 tracking-widest">İptal</button>
                                    <button type="submit" className="flex-1 py-4 font-black text-xs uppercase bg-emerald-600 rounded-xl text-white tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700">Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Product Modal */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[80vh] overflow-hidden flex flex-col">
                            <h3 className="text-xl font-bold mb-6">Ürün / Stok Seçimi</h3>
                            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                                {stocks.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-300 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{s.type === 'MOTHER_TREE' ? '🌳' : '🌱'}</span>
                                            <div>
                                                <p className="font-bold text-slate-800">{s.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kalan Stok: {s.currentStock || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="font-bold text-emerald-600 font-mono">₺{s.wholesalePrice || 0}</p>
                                            <button
                                                onClick={() => addToCart(s)}
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition"
                                            >
                                                + SEPETE EKLE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setIsProductModalOpen(false)} className="mt-6 w-full py-4 font-black text-xs uppercase bg-slate-100 rounded-xl text-slate-500 tracking-widest">Kapat</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
