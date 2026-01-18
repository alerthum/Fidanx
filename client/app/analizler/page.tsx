"use client";
import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function AnalizlerPage() {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 sticky lg:sticky lg:top-0 z-30">
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Üretim & Verim Analizleri</h1>
                    <p className="text-xs lg:text-sm text-slate-500">Ana ağaç verimi ve fide büyüme istatistikleri.</p>
                </header>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Üretim Durum Analizi */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 border-b border-slate-100 pb-2">Üretim Durum Dağılımı</h3>
                            <div className="space-y-6">
                                <AnalysisRow label="Dikim Aşamasında" value="2,400" percentage={30} color="bg-blue-400" />
                                <AnalysisRow label="Büyüme Sürecinde" value="5,200" percentage={60} color="bg-emerald-400" />
                                <AnalysisRow label="Satışa Hazır" value="820" percentage={10} color="bg-amber-400" />
                            </div>
                        </div>

                        {/* Ana Ağaç Verimliliği */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 border-b border-slate-100 pb-2">En Verimli Ana Ağaçlar</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Zeytin-A1', yield: '1,200 Dal / Sezon' },
                                    { name: 'Ceviz-C4', yield: '850 Dal / Sezon' },
                                    { name: 'Kayısı-K2', yield: '620 Dal / Sezon' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                        <span className="font-semibold text-slate-700">{item.name}</span>
                                        <span className="text-xs font-bold text-emerald-600">{item.yield}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Regional Data (Table format, no map here as user found it redundant) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase mb-6">Bölgesel Talep Analizi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <SmallStat label="Marmara" value="%42" />
                            <SmallStat label="Ege" value="%28" />
                            <SmallStat label="Akdeniz" value="%20" />
                            <SmallStat label="İç Anadolu" value="%10" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function AnalysisRow({ label, value, percentage, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">{label}</span>
                <span className="text-slate-800">{value} Adet</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

function SmallStat({ label, value }: any) {
    return (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
    );
}
