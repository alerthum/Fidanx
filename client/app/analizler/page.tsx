"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AnalizlerPage() {
    const [plants, setPlants] = useState<any[]>([]);
    const [production, setProduction] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pRes, prodRes, sRes] = await Promise.all([
                fetch(`${API_URL}/plants?tenantId=demo-tenant`),
                fetch(`${API_URL}/production/batches?tenantId=demo-tenant`),
                fetch(`${API_URL}/sales/orders?tenantId=demo-tenant`)
            ]);
            if (pRes.ok) setPlants(await pRes.json());
            if (prodRes.ok) setProduction(await prodRes.json());
            if (sRes.ok) setSales(await sRes.json());
        } catch (err) {
            console.error('Analiz verileri yüklenemedi:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Üretim Durum Dağılımı - gerçek veriden
    const stageMap: Record<string, string> = {
        'TEPSİ': 'Tepsi Aşamasında',
        'KÖKLENDIRME': 'Köklendirme',
        'REPIKAJ': 'Repikaj',
        'SATIŞA_HAZIR': 'Satışa Hazır',
        'HAZIR': 'Satışa Hazır'
    };

    const stageCounts: Record<string, number> = {};
    production.forEach(b => {
        const label = stageMap[b.stage] || b.stage || 'Diğer';
        stageCounts[label] = (stageCounts[label] || 0) + (b.quantity || 1);
    });
    const totalProduction = Object.values(stageCounts).reduce((s, v) => s + v, 0) || 1;

    // En Verimli Bitkiler — viyol ve çelik bazlı
    const topPlants = plants
        .filter(p => p.viyolCount || p.cuttingCount)
        .sort((a, b) => (b.cuttingCount || 0) - (a.cuttingCount || 0))
        .slice(0, 6);

    // Bölgesel Satış Analizi - gerçek veriden
    const regionMap: Record<string, string> = {
        'İstanbul': 'Marmara', 'Bursa': 'Marmara', 'Edirne': 'Marmara', 'Kocaeli': 'Marmara', 'Sakarya': 'Marmara',
        'İzmir': 'Ege', 'Manisa': 'Ege', 'Aydın': 'Ege', 'Denizli': 'Ege', 'Muğla': 'Ege',
        'Antalya': 'Akdeniz', 'Adana': 'Akdeniz', 'Mersin': 'Akdeniz', 'Isparta': 'Akdeniz',
        'Ankara': 'İç Anadolu', 'Konya': 'İç Anadolu', 'Eskişehir': 'İç Anadolu', 'Kayseri': 'İç Anadolu',
        'Trabzon': 'Karadeniz', 'Samsun': 'Karadeniz', 'Rize': 'Karadeniz',
        'Erzurum': 'Doğu Anadolu', 'Van': 'Doğu Anadolu', 'Malatya': 'Doğu Anadolu',
        'Diyarbakır': 'Güneydoğu', 'Gaziantep': 'Güneydoğu', 'Şanlıurfa': 'Güneydoğu'
    };

    const salesByRegion: Record<string, number> = {};
    sales.forEach(order => {
        const addr = order.shippingAddress || order.customerName || '';
        const city = Object.keys(regionMap).find(c => addr.includes(c));
        const region = city ? regionMap[city] : 'Diğer';
        salesByRegion[region] = (salesByRegion[region] || 0) + (order.totalAmount || 0);
    });
    const totalSales = Object.values(salesByRegion).reduce((s, v) => s + v, 0) || 1;
    const regionEntries = Object.entries(salesByRegion).sort((a, b) => b[1] - a[1]);

    // Stok Kategorisi  
    const categoryCounts: Record<string, { count: number, stock: number }> = {};
    plants.forEach(p => {
        const cat = p.category || p.type || 'Diğer';
        if (!categoryCounts[cat]) categoryCounts[cat] = { count: 0, stock: 0 };
        categoryCounts[cat].count++;
        categoryCounts[cat].stock += p.currentStock || 0;
    });
    const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1].stock - a[1].stock);
    const maxCatStock = categoryEntries.length > 0 ? categoryEntries[0][1].stock : 1;

    const stageColors: Record<string, string> = {
        'Tepsi Aşamasında': 'bg-blue-400',
        'Köklendirme': 'bg-emerald-400',
        'Repikaj': 'bg-amber-400',
        'Satışa Hazır': 'bg-green-500',
        'Diğer': 'bg-slate-400'
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc] font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-5 sticky top-0 z-30 shadow-sm flex justify-between items-center">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Üretim & Verim Analizleri</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Gerçek zamanlı üretim, verim ve satış istatistikleri.</p>
                    </div>
                    <button onClick={fetchData} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                        🔄 Yenile
                    </button>
                </header>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 mt-4 font-bold text-[10px] uppercase tracking-widest">Veriler Yükleniyor...</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 lg:p-8 space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickStat icon="🌱" label="Toplam Bitki Çeşidi" value={plants.length.toString()} />
                            <QuickStat icon="🧪" label="Aktif Üretim Partisi" value={production.length.toString()} />
                            <QuickStat icon="🧫" label="Toplam Viyol" value={plants.reduce((s, p) => s + (p.viyolCount || 0), 0).toLocaleString()} />
                            <QuickStat icon="🌿" label="Toplam Çelik" value={plants.reduce((s, p) => s + (p.cuttingCount || 0), 0).toLocaleString()} />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Üretim Durum Dağılımı */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Üretim Durum Dağılımı</h3>
                                {Object.keys(stageCounts).length === 0 ? (
                                    <p className="text-slate-400 italic text-sm text-center py-8">Üretim partisi bulunamadı.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {Object.entries(stageCounts).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
                                            <div key={label}>
                                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                                    <span className="text-slate-600">{label}</span>
                                                    <span className="text-slate-800">{count.toLocaleString()} Adet</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${stageColors[label] || 'bg-slate-400'}`}
                                                        style={{ width: `${(count / totalProduction) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* En Verimli Bitkiler */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">En Yüksek Çelik Kapasiteli Bitkiler</h3>
                                {topPlants.length === 0 ? (
                                    <p className="text-slate-400 italic text-sm text-center py-8">Viyol verisi bulunamadı.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {topPlants.map((p, i) => (
                                            <div key={p.id || i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-emerald-50/50 transition">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{i < 3 ? ['🥇', '🥈', '🥉'][i] : '🌱'}</span>
                                                    <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-emerald-600">{(p.cuttingCount || 0).toLocaleString()} çelik</span>
                                                    <span className="text-xs text-slate-400 ml-2">({p.viyolCount || 0} viyol)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Kategori Bazlı Stok */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Kategori Bazlı Stok Dağılımı</h3>
                                <div className="space-y-3">
                                    {categoryEntries.map(([cat, data]) => (
                                        <div key={cat}>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-slate-600">{cat}</span>
                                                <span className="text-slate-800">{data.stock.toLocaleString()} ({data.count} çeşit)</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                                                    style={{ width: `${(data.stock / maxCatStock) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                    {categoryEntries.length === 0 && (
                                        <p className="text-slate-400 italic text-sm text-center py-6">Stok verisi yok.</p>
                                    )}
                                </div>
                            </div>

                            {/* Bölgesel Satış */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Bölgesel Satış Analizi</h3>
                                {regionEntries.length === 0 ? (
                                    <p className="text-slate-400 italic text-sm text-center py-8">Henüz satış verisi yok.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {regionEntries.map(([region, amount]) => (
                                            <div key={region} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <span className="text-sm font-bold text-slate-600">{region}</span>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-800">₺{amount.toLocaleString('tr-TR')}</span>
                                                    <span className="text-[10px] text-slate-400 ml-2">%{Math.round((amount / totalSales) * 100)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function QuickStat({ icon, label, value }: { icon: string, label: string, value: string }) {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-lg font-black text-slate-800">{value}</p>
        </div>
    );
}
