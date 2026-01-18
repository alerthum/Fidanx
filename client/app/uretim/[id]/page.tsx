"use client";
import React, { useState } from 'react';

export default function BatchDetailPage({ params }: { params: { id: string } }) {
    // Mock detailed data based on user's workflow
    const [batch] = useState({
        id: 'BX-DEMO-001',
        plantName: 'Ficus Lyrata (Keman Yapraklı)',
        source: 'Anaç Bahçesi - Bölge A1',
        plantedAt: '2023-11-15',
        totalQuantity: 500,
        currentQuantity: 200,
        soldQuantity: 300,
        currentPotSize: '5x5 Plastik Kap',
        totalCost: '1,250.00 TL',
        status: 'GROWING',
        history: [
            { date: '2023-11-15', stage: 'VİYOL', status: '70 Gözlü Viyol', note: 'Anaçtan alınan çelikler dikildi.', cost: '200 TL' },
            { date: '2024-01-10', stage: 'ŞAŞIRTMA', status: '5x5 Plastik Kap', note: 'Viyolden saksıya geçiş. 500/500 başarı.', cost: '400 TL' },
            { date: '2024-03-01', stage: 'SATIŞ', status: '5x5 Plastik Kap', note: '300 adet toplu satış yapıldı.', qty: -300 },
        ]
    });

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10">
            <header className="flex justify-between items-start">
                <div>
                    <nav className="text-sm text-slate-500 mb-2">Üretim / Partiler / {batch.id}</nav>
                    <h1 className="text-3xl font-extrabold text-slate-900">{batch.plantName}</h1>
                    <p className="text-slate-500 mt-1">Kaynak: <span className="font-semibold text-slate-700">{batch.source}</span></p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm">
                        Barkod Yazdır
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
                        Saksı Değiştir (Büyüt)
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Mevcut Stok" value={batch.currentQuantity} sub={`${batch.totalQuantity} adet ile başlandı`} />
                <MetricCard title="Satılan" value={batch.soldQuantity} sub="Toplam satış" />
                <MetricCard title="Toplam Maliyet" value={batch.totalCost} sub="Birim maliyet: 6.25 TL" />
                <MetricCard title="Verim" value="%100" sub="Fire verilmedi" color="text-green-600" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Yaşam Döngüsü & Geçmiş</h2>
                    <span className="text-sm font-medium text-slate-500">Kayıt Sayısı: {batch.history.length}</span>
                </div>
                <div className="p-6">
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {batch.history.map((log, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-green-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <span className="text-xs font-bold">{i + 1}</span>
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-slate-900">{log.stage}</div>
                                        <time className="font-mono text-xs text-indigo-500 font-bold">{log.date}</time>
                                    </div>
                                    <div className="text-slate-500 text-sm mb-2">{log.note}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{log.status}</span>
                                        {log.cost && <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">Maliyet: {log.cost}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 border-dashed">
                <h2 className="text-xl font-bold text-indigo-900 mb-4">Satış Sonrası Takip</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
                        <p className="text-sm font-bold text-indigo-400 uppercase mb-2">Müşteri Deneyimi</p>
                        <p className="text-slate-700 italic">"Ankara Peyzaj ile görüşüldü. Bitkilerin adaptasyon süreci başarılı. 300 adetten sadece 2 tanesinde hafif sararma var."</p>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Son Güncelleme: 1 hafta önce</span>
                            <button className="text-indigo-600 text-sm font-bold">Ziyaret Kaydı Ekle</button>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex flex-col justify-center items-center">
                        <p className="text-sm font-bold text-indigo-400 uppercase mb-2">Tutma Oranı</p>
                        <div className="text-4xl font-extrabold text-indigo-600">%99.3</div>
                        <p className="text-xs text-slate-400 mt-1">Müşteri geri bildirimlerine göre</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function MetricCard({ title, value, sub, color = "text-slate-900" }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
    );
}
