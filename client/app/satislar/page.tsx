"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

export default function SatislarPage() {
    const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);
    const [activeTab, setActiveTab] = useState<'NEW_ORDER' | 'ORDERS' | 'CUSTOMERS'>('ORDERS');
    const [customers, setCustomers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stocks, setStocks] = useState<any[]>([]);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [newCustomer, setNewCustomer] = useState({
        id: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        type: 'Bireysel', // Bireysel, Kurumsal
        taxId: '',
        taxOffice: '',
        contacts: [] as any[], // {name, phone, role}
        addresses: [] as any[], // {title, address}
        isEdit: false,
        // New ERP fields
        sector: '',
        currency: 'TRY',
        paymentTerm: '',
        riskLimit: '',
        discountRatio: '',
        website: '',
        kepAddress: '',
        city: '',
        district: '',
        zipCode: ''
    });

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
            setStocks(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${API_URL}/sales/customers?tenantId=demo-tenant`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) { setCustomers([]); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/sales/orders?tenantId=demo-tenant`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) { setOrders([]); }
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = newCustomer.isEdit
                ? `${API_URL}/sales/customers/${newCustomer.id}?tenantId=demo-tenant`
                : `${API_URL}/sales/customers?tenantId=demo-tenant`;

            const method = newCustomer.isEdit ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer),
            });
            if (res.ok) {
                setIsCustomerModalOpen(false);
                resetCustomerForm();
                fetchCustomers();
                // Aktivite Logla
                fetch(`${API_URL}/activity?tenantId=demo-tenant`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: newCustomer.isEdit ? 'Müşteri Güncelleme' : 'Yeni Müşteri',
                        title: `${newCustomer.name} ${newCustomer.isEdit ? 'güncellendi' : 'eklendi'}.`,
                        icon: '👤',
                        color: 'bg-purple-50 text-purple-600'
                    })
                });
            }
        } catch (err) { }
    };

    const resetCustomerForm = () => {
        setNewCustomer({
            id: '', name: '', phone: '', email: '', address: '', note: '',
            type: 'Bireysel', taxId: '', taxOffice: '', contacts: [], addresses: [], isEdit: false,
            sector: '', currency: 'TRY', paymentTerm: '', riskLimit: '', discountRatio: '', website: '', kepAddress: '', city: '', district: '', zipCode: ''
        });
    };

    const openEditCustomer = (c: any) => {
        setNewCustomer({
            ...newCustomer, // Keep default fields
            id: c.id,
            name: c.name,
            phone: c.phone || '',
            email: c.email || '',
            address: c.address || '',
            note: c.note || '',
            type: c.type || 'Bireysel',
            taxId: c.taxId || '',
            taxOffice: c.taxOffice || '',
            contacts: c.contacts || [],
            addresses: c.addresses || [],
            isEdit: true,
            // Map new fields if they exist in future backend
            sector: c.sector || '',
            currency: c.currency || 'TRY',
            paymentTerm: c.paymentTerm || '',
            riskLimit: c.riskLimit || '',
            discountRatio: c.discountRatio || '',
            website: c.website || '',
            kepAddress: c.kepAddress || '',
            city: c.city || '',
            district: c.district || '',
            zipCode: c.zipCode || ''
        });
        setIsCustomerModalOpen(true);
    };

    // Cart Logic
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
            status: 'Bekliyor'
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
                // Aktivite Logla
                fetch(`${API_URL}/activity?tenantId=demo-tenant`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'Satış/Sipariş', title: `${customer?.name} - ₺${totalAmount.toLocaleString()} sipariş oluşturuldu.`, icon: '💰', color: 'bg-emerald-50 text-emerald-600' })
                });
            }
        } catch (err) { }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        if (status === 'Tamamlandı' && !confirm('Sipariş tamamlandığında stoklar düşülecektir. Emin misiniz?')) return;

        try {
            const res = await fetch(`${API_URL}/sales/orders/${id}/status?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchOrders();
                fetchStocks(); // Stokları güncelle

                // Aktivite
                if (status === 'Tamamlandı') {
                    fetch(`${API_URL}/activity?tenantId=demo-tenant`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'Satış Onayı', title: `Sipariş tamamlandı ve stoktan düşüldü.`, icon: '✅', color: 'bg-emerald-50 text-emerald-600' })
                    });
                }
            }
        } catch (err) { alert('İşlem başarısız.'); }
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
                                onClick={() => { resetCustomerForm(); setIsCustomerModalOpen(true); }}
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
                            {activeTab === 'ORDERS' && <ExportButton title="Siparişler" tableId="orders-table" />}
                            {activeTab === 'CUSTOMERS' && <ExportButton title="Müşteriler" tableId="customers-table" />}
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
                            <table className="w-full text-left font-bold text-sm" id="orders-table">
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
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${o.status === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    o.status === 'İptal' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-900 font-mono">₺{(o.totalAmount || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                {o.status === 'Bekliyor' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => updateOrderStatus(o.id, 'Tamamlandı')}
                                                            className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition"
                                                        >
                                                            ✓ Onayla
                                                        </button>
                                                        <button
                                                            onClick={() => updateOrderStatus(o.id, 'İptal')}
                                                            className="text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition"
                                                        >
                                                            × İptal
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
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
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left" id="customers-table">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Müşteri / Firma</th>
                                        <th className="px-6 py-4">Tür & VKN/TC</th>
                                        <th className="px-6 py-4">İletişim & Yetkili</th>
                                        <th className="px-6 py-4">Adres</th>
                                        <th className="px-6 py-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {customers.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50 text-sm">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700">{c.name}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.type || 'Bireysel'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs">
                                                    {c.taxId ? (
                                                        <>
                                                            <p className="font-mono font-bold text-slate-600">{c.taxId}</p>
                                                            <p className="text-[10px] text-slate-400">{c.taxOffice || 'VD Bilgisi Yok'}</p>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 italic">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <p className="font-bold text-slate-700">{c.phone}</p>
                                                <p className="text-xs">{c.email}</p>
                                                {c.contacts && c.contacts.length > 0 && (
                                                    <div className="mt-1 pt-1 border-t border-slate-100">
                                                        <p className="text-[9px] font-bold text-emerald-600">Yetkili: {c.contacts[0].name}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">{c.address || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openEditCustomer(c)}
                                                    className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition"
                                                >
                                                    ✏️ Düzenle
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Kayıtlı müşteri yok.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detailed ERP Customer Modal */}
                {isCustomerModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
                            <CustomerModalContent
                                newCustomer={newCustomer}
                                setNewCustomer={setNewCustomer}
                                onClose={() => setIsCustomerModalOpen(false)}
                                onSave={handleCreateCustomer}
                            />
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

const CustomerModalContent = ({ newCustomer, setNewCustomer, onClose, onSave }: any) => {
    const [tab, setTab] = useState('GENEL');

    const updateContact = (index: number, field: string, value: string) => {
        const updated = [...newCustomer.contacts];
        updated[index][field] = value;
        setNewCustomer({ ...newCustomer, contacts: updated });
    };

    const addContact = () => {
        setNewCustomer({ ...newCustomer, contacts: [...(newCustomer.contacts || []), { name: '', phone: '', role: '' }] });
    };

    const removeContact = (index: number) => {
        setNewCustomer({ ...newCustomer, contacts: newCustomer.contacts.filter((_: any, i: number) => i !== index) });
    };

    return (
        <React.Fragment>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{newCustomer.isEdit ? 'Cari Kartı Düzenle' : 'Yeni Cari Kart / Müşteri'}</h3>
                    <p className="text-xs text-slate-400 font-medium">ERP Standartlarında Tam Detaylı Kayıt</p>
                </div>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-100 flex gap-6 bg-white sticky top-0 z-10">
                {['GENEL', 'FİNANSAL', 'İLETİŞİM', 'ADRESLER', 'DİĞER'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`py-4 text-[10px] font-black tracking-widest transition-all relative ${tab === t ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {t} BİLGİLER
                        {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
                    </button>
                ))}
            </div>

            <form onSubmit={onSave} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f8fafc]">

                {tab === 'GENEL' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ticari Ünvan / Ad Soyad</label>
                            <input required className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm font-bold shadow-sm" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                            <p className="text-[9px] text-slate-400 mt-1 italic">Yasal fatura başlığı buraya girilmelidir.</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Müşteri Grubu</label>
                            <select className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" value={newCustomer.type} onChange={e => setNewCustomer({ ...newCustomer, type: e.target.value })}>
                                <option value="Bireysel">👤 Bireysel (Nihai Tüketici)</option>
                                <option value="Kurumsal">🏢 Kurumsal (Firma)</option>
                                <option value="Bayi">🤝 Bayi / Satıcı</option>
                                <option value="Kamu">🏛️ Kamu Kurumu</option>
                                <option value="Ihracat">🌍 İhracat Müşterisi</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sektör</label>
                            <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" placeholder="Örn: Peyzaj, Tarım, İnşaat" value={newCustomer.sector || ''} onChange={e => setNewCustomer({ ...newCustomer, sector: e.target.value })} />
                        </div>
                    </div>
                )}

                {tab === 'FİNANSAL' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{newCustomer.type === 'Bireysel' ? 'TC Kimlik No' : 'Vergi Kimlik No (VKN)'}</label>
                                <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm font-mono shadow-sm" value={newCustomer.taxId} onChange={e => setNewCustomer({ ...newCustomer, taxId: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vergi Dairesi</label>
                                <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" value={newCustomer.taxOffice} onChange={e => setNewCustomer({ ...newCustomer, taxOffice: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Para Birimi</label>
                                <select className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" value={newCustomer.currency || 'TRY'} onChange={e => setNewCustomer({ ...newCustomer, currency: e.target.value })}>
                                    <option value="TRY">₺ Türk Lirası</option>
                                    <option value="USD">$ Amerikan Doları</option>
                                    <option value="EUR">€ Euro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vade (Gün)</label>
                                <input type="number" className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" placeholder="Örn: 30" value={newCustomer.paymentTerm || ''} onChange={e => setNewCustomer({ ...newCustomer, paymentTerm: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Risk Limiti (TL)</label>
                                <input type="number" className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" placeholder="0.00" value={newCustomer.riskLimit || ''} onChange={e => setNewCustomer({ ...newCustomer, riskLimit: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sabit İskonto (%)</label>
                                <input type="number" className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" placeholder="0" value={newCustomer.discountRatio || ''} onChange={e => setNewCustomer({ ...newCustomer, discountRatio: e.target.value })} />
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                            <strong>Bilgi:</strong> e-Fatura mükellef durumu VKN girildiğinde entegratör üzerinden otomatik sorgulanır.
                        </div>
                    </div>
                )}

                {tab === 'İLETİŞİM' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Merkez Telefon</label>
                                <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kurumsal E-Posta</label>
                                <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Web Sitesi</label>
                                <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" placeholder="https://" value={newCustomer.website || ''} onChange={e => setNewCustomer({ ...newCustomer, website: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">KEP Adresi</label>
                                <input className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm shadow-sm" value={newCustomer.kepAddress || ''} onChange={e => setNewCustomer({ ...newCustomer, kepAddress: e.target.value })} />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-700 text-sm">Yetkili Kişiler</h4>
                                <button type="button" onClick={addContact} className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition shadow-sm border border-emerald-100">+ Yeni Kişi Ekle</button>
                            </div>

                            <div className="space-y-3">
                                {(newCustomer.contacts || []).length === 0 && <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center">Henüz yetkili kişi eklenmedi.</p>}
                                {(newCustomer.contacts || []).map((contact: any, idx: number) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                                        <div className="absolute -left-2 top-4 w-1 h-8 bg-emerald-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex-1 w-full space-y-1">
                                            <span className="text-[9px] uppercase font-bold text-slate-400">Ad Soyad</span>
                                            <input className="w-full bg-slate-50 p-2 text-xs rounded border border-slate-200 outline-none focus:border-emerald-400" value={contact.name} onChange={e => updateContact(idx, 'name', e.target.value)} />
                                        </div>
                                        <div className="flex-1 w-full space-y-1">
                                            <span className="text-[9px] uppercase font-bold text-slate-400">Görevi / Pozisyon</span>
                                            <input className="w-full bg-slate-50 p-2 text-xs rounded border border-slate-200 outline-none focus:border-emerald-400" value={contact.role} onChange={e => updateContact(idx, 'role', e.target.value)} />
                                        </div>
                                        <div className="flex-1 w-full space-y-1">
                                            <span className="text-[9px] uppercase font-bold text-slate-400">Dahili / Cep</span>
                                            <input className="w-full bg-slate-50 p-2 text-xs rounded border border-slate-200 outline-none focus:border-emerald-400" value={contact.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} />
                                        </div>
                                        <button type="button" onClick={() => removeContact(idx)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded self-end mb-0.5 transition">🗑️</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'ADRESLER' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fatura Adresi (Yasal)</label>
                            <textarea className="w-full p-3 bg-white rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-sm h-24 resize-none shadow-sm" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                            <div className="flex gap-4 mt-2">
                                <div className="flex-1">
                                    <input className="w-full p-2 bg-slate-50 rounded-lg outline-none border border-slate-200 text-xs" placeholder="İl" value={newCustomer.city || ''} onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })} />
                                </div>
                                <div className="flex-1">
                                    <input className="w-full p-2 bg-slate-50 rounded-lg outline-none border border-slate-200 text-xs" placeholder="İlçe" value={newCustomer.district || ''} onChange={e => setNewCustomer({ ...newCustomer, district: e.target.value })} />
                                </div>
                                <div className="flex-1">
                                    <input className="w-full p-2 bg-slate-50 rounded-lg outline-none border border-slate-200 text-xs" placeholder="Posta Kodu" value={newCustomer.zipCode || ''} onChange={e => setNewCustomer({ ...newCustomer, zipCode: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center">
                            <p className="text-slate-500 text-xs font-medium">📍 Çoklu Sevk Adresi ve Depo Yönetimi özelliği yakında eklenecektir.</p>
                        </div>
                    </div>
                )}

                {tab === 'DİĞER' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Özel Notlar / Uyarılar</label>
                            <textarea className="w-full p-4 bg-amber-50 rounded-xl outline-none border border-amber-200 focus:border-amber-400 text-sm h-32 resize-none text-amber-900 placeholder-amber-400/50" placeholder="Bu müşteri için dikkat edilmesi gereken özel durumlar..." value={newCustomer.note} onChange={e => setNewCustomer({ ...newCustomer, note: e.target.value })} />
                        </div>
                    </div>
                )}

            </form>

            <div className="p-6 border-t border-slate-200 bg-white flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-xs uppercase bg-white border border-slate-200 rounded-xl text-slate-500 tracking-widest hover:bg-slate-50 transition active:scale-95">İptal</button>
                <button onClick={onSave} className="flex-1 py-4 font-black text-xs uppercase bg-emerald-600 rounded-xl text-white tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95">Kaydet</button>
            </div>
        </React.Fragment>
    );
};
