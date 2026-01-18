"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SatislarPage() {
    const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 min-w-0">
                <header className="bg-white border-b border-slate-200 p-4 lg:p-6 lg:sticky lg:top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Yeni Satış</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Müşteri seçin ve fidanları sepete ekleyin.</p>
                    </div>
                    <button className="text-sm font-semibold text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition w-full sm:w-auto text-left sm:text-center">İptal Et</button>
                </header>

                <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Müşteri Seçimi</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Netsis Cari Listesinde Ara..."
                                    className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                            </div>
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
                            <button className="h-28 bg-white border-2 border-dashed border-emerald-200 text-emerald-700 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
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
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-28 space-y-8">
                            <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Sipariş Özeti</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-slate-400">
                                    <span>Ara Toplam</span>
                                    <span className="font-mono">₺0,00</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>KDV (%20)</span>
                                    <span className="font-mono">₺0,00</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 border-t border-slate-800">
                                    <span>Toplam</span>
                                    <span className="text-emerald-400 font-mono">₺0,00</span>
                                </div>
                            </div>
                            <button className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                                Satışı Tamamla
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
