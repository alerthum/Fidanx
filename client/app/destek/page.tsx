"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DestekPage() {
    const [tickets, setTickets] = useState([
        { id: '1', customer: 'Audit Test Tarım', subject: 'Zeytin Fidanı Renk Değişimi', status: 'Açık', date: '18.01.2026', content: 'Fidanların yapraklarında sararma gözlemlendi.' },
        { id: '2', customer: 'Yeşil Bahçe Ltd.', subject: 'Nakliye Esnasında Hasar', status: 'Çözüldü', date: '15.01.2026', content: 'Kargoda 5 adet fidan saksısı kırılmış.' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ customer: '', subject: '', content: '', status: 'Açık' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201';

    const handleAddTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const ticket = {
            ...newTicket,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toLocaleDateString('tr-TR'),
        };
        setTickets([ticket, ...tickets]);
        setNewTicket({ customer: '', subject: '', content: '', status: 'Açık' });
        setIsModalOpen(false);
    };

    const toggleStatus = (id: string) => {
        setTickets(tickets.map(t =>
            t.id === id ? { ...t, status: t.status === 'Açık' ? 'Çözüldü' : 'Açık' } : t
        ));
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky lg:sticky lg:top-0 z-30 shadow-sm gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Destek & Feedback</h1>
                        <p className="text-xs lg:text-sm text-slate-500 font-medium">Müşteri geri bildirimleri ve teknik destek.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition active:scale-95"
                    >
                        + Yeni Bildirim
                    </button>
                </header>

                <div className="p-4 md:p-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Müşteri / Firma</th>
                                        <th className="px-6 py-4">Konu & Detay</th>
                                        <th className="px-6 py-4">Tarih</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-slate-50 transition group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 leading-tight">{ticket.customer}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-1">#TIC-{ticket.id.toUpperCase().slice(0, 4)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-600">{ticket.subject}</p>
                                                <p className="text-[11px] text-slate-400 truncate max-w-[300px]">{ticket.content}</p>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">{ticket.date}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(ticket.id)}
                                                    className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-colors ${ticket.status === 'Açık'
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}
                                                >
                                                    {ticket.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-300 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-colors">GÖRÜNTÜLE</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {tickets.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="text-4xl mb-4">💬</div>
                                                <p className="text-slate-400 italic text-sm font-medium">Henüz bir destek bildirimi bulunmuyor.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create Ticket Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Yeni Destek Bildirimi Oluştur</h3>
                            <form onSubmit={handleAddTicket} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Müşteri / Firma Adı</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTicket.customer}
                                        onChange={(e) => setNewTicket({ ...newTicket, customer: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition"
                                        placeholder="Örn: Kuzey Tarım A.Ş."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bildirim Konusu</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition"
                                        placeholder="Örn: Fidan sevkiyatı hakkında"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Detaylı Açıklama</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newTicket.content}
                                        onChange={(e) => setNewTicket({ ...newTicket, content: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition resize-none"
                                        placeholder="Lütfen sorunu veya talebi detaylandırın..."
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition uppercase text-xs tracking-widest">İptal</button>
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95 uppercase text-xs tracking-widest">Bildirimi Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
