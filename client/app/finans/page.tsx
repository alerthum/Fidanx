"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

export default function FinansPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: 'Enerji',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Enerji', 'İşçilik', 'Bakım/Onarım', 'Lojistik', 'Kira', 'Vergi', 'Diğer'];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [expRes, salesRes, purchRes] = await Promise.all([
                fetch(`${API_URL}/finans/expenses?tenantId=demo-tenant`),
                fetch(`${API_URL}/sales/orders?tenantId=demo-tenant`),
                fetch(`${API_URL}/purchases?tenantId=demo-tenant`)
            ]);

            if (expRes.ok) setExpenses(await expRes.json());
            if (salesRes.ok) setSales(await salesRes.json());
            if (purchRes.ok) setPurchases(await purchRes.json());
        } catch (err) { }
    };

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/finans/expenses?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewExpense({ category: 'Enerji', amount: 0, description: '', date: new Date().toISOString().split('T')[0] });
                fetchData();
            }
        } catch (err) { alert('Hata oluştu'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${API_URL}/finans/expenses/${id}?tenantId=demo-tenant`, { method: 'DELETE' });
            fetchData();
        } catch (err) { }
    };

    // Financial calculations
    const totalSalesIncome = sales
        .filter(s => s.status === 'Tamamlandı') // Only realized income
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const totalPurchaseCost = purchases
        .filter(p => p.status === 'Tamamlandı') // Only realized cost
        .reduce((sum, p) => sum + (p.totalCost || 0), 0);

    const totalOperatingExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalExpense = totalPurchaseCost + totalOperatingExpense;
    const netProfit = totalSalesIncome - totalExpense;

    // Merge transactions for timeline list
    const transactions = [
        ...sales.filter(s => s.status === 'Tamamlandı').map(s => ({
            id: s.id, type: 'income', date: s.orderDate, amount: s.totalAmount, label: `Satış: ${s.customerName}`, category: 'Satış Geliri', isDeletable: false
        })),
        ...purchases.filter(p => p.status === 'Tamamlandı').map(p => ({
            id: p.id, type: 'expense', date: p.orderDate, amount: p.totalCost, label: `Satınalma: ${p.supplier}`, category: 'Hammadde', isDeletable: false
        })),
        ...expenses.map(e => ({
            id: e.id, type: 'expense', date: e.date, amount: e.amount, label: e.description, category: e.category, isDeletable: true
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Finans & Gider Yönetimi</h1>
                        <p className="text-sm text-slate-500">Gelir, gider ve nakit akışı takibi.</p>
                    </div>
                    <div className="flex gap-3">
                        <ExportButton title="Finans Raporu" tableId="finance-table" />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 shadow-md transition active:scale-95"
                        >
                            - Gider Ekle
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 transition group-hover:scale-110"></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">Toplam Gelir</h3>
                            <p className="text-3xl font-black text-emerald-600 mt-2 relative z-10">
                                {totalSalesIncome.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                            <p className="text-[10px] text-emerald-400 font-bold mt-1 relative z-10">Tamamlanan Satışlar</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 transition group-hover:scale-110"></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">Toplam Gider</h3>
                            <p className="text-3xl font-black text-rose-600 mt-2 relative z-10">
                                {totalExpense.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                            <p className="text-[10px] text-rose-400 font-bold mt-1 relative z-10">Satınalma + İşletme</p>
                        </div>

                        <div className={`bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden group ${netProfit >= 0 ? 'border-blue-100' : 'border-amber-100'}`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 transition group-hover:scale-110 ${netProfit >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">Net Kar / Zarar</h3>
                            <p className={`text-3xl font-black mt-2 relative z-10 ${netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                {netProfit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                            <p className={`text-[10px] font-bold mt-1 relative z-10 ${netProfit >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                                {netProfit >= 0 ? '🎉 Kar Durumu' : '⚠️ Zarar Durumu'}
                            </p>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Son İşlemler (Nakit Akışı)</h3>
                        </div>
                        <table className="w-full text-left" id="finance-table">
                            <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4">Açıklama</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4 text-right">Tutar</th>
                                    <th className="px-6 py-4 text-center">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {transactions.map((t, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(t.date).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{t.label}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] uppercase font-black tracking-wide ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {t.isDeletable && (
                                                <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-rose-500 transition text-lg leading-none">×</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 italic">Kayıtlı işlem yok.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Expense Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Yeni Gider Kaydı</h3>
                            <form onSubmit={handleCreateExpense} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Açıklama</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                                        placeholder="Örn: Elektrik Faturası"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tutar (TL)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarih</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-500"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition">İptal</button>
                                    <button type="submit" className="flex-1 py-3 text-white font-bold bg-rose-600 rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition">Harcamayı Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
