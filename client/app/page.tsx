"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TurkeyMap from '@/components/TurkeyMap';
import Link from 'next/link';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [stats, setStats] = useState({ totalStock: 0, totalOrders: 0, totalExpenses: 0, viyolCount: 0, celikCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState({ healthy: 0, observation: 0, critical: 0 });
  const [regionalSales, setRegionalSales] = useState<Record<string, number>>({});
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

  const [tempStats, setTempStats] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchActivities();
    fetchTemperatureData();
  }, []);

  const fetchTemperatureData = async () => {
    try {
      const res = await fetch(`${API_URL}/production/temperature-logs?tenantId=demo-tenant`);
      if (!res.ok) return;
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) return;

      // Group by Month -> Time of Day
      const monthlyStats: Record<string, { sabah: number[], ogle: number[], aksam: number[] }> = {};

      data.forEach((log: any) => {
        if (!log.date || !log.seraIci) return;
        const date = new Date(log.date);
        const monthKey = date.toLocaleString('tr-TR', { month: 'short' }); // Short month name (Oca, Şub...)

        if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { sabah: [], ogle: [], aksam: [] };

        if (log.seraIci.sabah) monthlyStats[monthKey].sabah.push(parseFloat(log.seraIci.sabah));
        if (log.seraIci.ogle) monthlyStats[monthKey].ogle.push(parseFloat(log.seraIci.ogle));
        if (log.seraIci.aksam) monthlyStats[monthKey].aksam.push(parseFloat(log.seraIci.aksam));
      });

      const stats = Object.entries(monthlyStats).map(([month, times]) => {
        const maxSabah = times.sabah.length > 0 ? Math.max(...times.sabah) : 0;
        const maxOgle = times.ogle.length > 0 ? Math.max(...times.ogle) : 0;
        const maxAksam = times.aksam.length > 0 ? Math.max(...times.aksam) : 0;

        return {
          month,
          sabah: maxSabah.toFixed(1),
          ogle: maxOgle.toFixed(1),
          aksam: maxAksam.toFixed(1)
        };
      });

      // Sort by month logic or simple reverse for recent
      // Let's assume data comes somewhat ordered or reverse to show latest
      setTempStats(stats); // You might want to sort this properly by month index in a real app
    } catch (err) { console.error(err); }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`${API_URL}/activity?tenantId=demo-tenant`);
      const data = await res.json();
      setActivities(data);
    } catch (err) { }
  };

  const fetchStats = async () => {
    try {
      const [pRes, oRes, eRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/plants?tenantId=demo-tenant`),
        fetch(`${API_URL}/sales/orders?tenantId=demo-tenant`),
        fetch(`${API_URL}/finans/expenses?tenantId=demo-tenant`),
        fetch(`${API_URL}/production/batches?tenantId=demo-tenant`)
      ]);
      const [plants, orders, expenses, production] = await Promise.all([
        pRes.ok ? pRes.json() : [],
        oRes.ok ? oRes.json() : [],
        eRes.ok ? eRes.json() : [],
        prodRes.ok ? prodRes.json() : []
      ]);

      setStats({
        totalStock: Array.isArray(plants) ? plants.reduce((acc: number, p: any) => acc + (p.currentStock || 0), 0) : 0,
        totalOrders: Array.isArray(orders) ? orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0) : 0,
        totalExpenses: Array.isArray(expenses) ? expenses.reduce((acc: number, e: any) => acc + (parseFloat(e.amount) || 0), 0) : 0,
        viyolCount: Array.isArray(plants) ? plants.reduce((acc: number, p: any) => acc + (p.viyolCount || 0), 0) : 0,
        celikCount: Array.isArray(plants) ? plants.reduce((acc: number, p: any) => acc + (p.cuttingCount || 0), 0) : 0
      });

      // Calculate Health Status (Simplified Logic based on Production Batches)
      // If batch has "hastalık" in note or history, mark critical.
      // If batch is older than 60 days in 'TEPSİ' stage, mark observation.
      // Else healthy.
      let h = 0, o = 0, c = 0;
      const totalBatches = Array.isArray(production) ? production.length : 0;

      if (Array.isArray(production) && totalBatches > 0) {
        production.forEach((batch: any) => {
          const historyStr = JSON.stringify(batch.history || "").toLowerCase();
          if (historyStr.includes('hastalık') || historyStr.includes('risk')) {
            c++;
          } else if (batch.stage === 'TEPSİ' && batch.startDate) {
            const daysOld = (new Date().getTime() - new Date(batch.startDate).getTime()) / (1000 * 3600 * 24);
            if (daysOld > 60) o++;
            else h++;
          } else {
            h++;
          }
        });
      }

      // Calculate Percentages
      if (totalBatches > 0) {
        setHealthStatus({
          healthy: Math.round((h / totalBatches) * 100),
          observation: Math.round((o / totalBatches) * 100),
          critical: Math.round((c / totalBatches) * 100)
        });
      } else {
        setHealthStatus({ healthy: 0, observation: 0, critical: 0 });
      }


      // Calculate Regional Sales
      // Mock mapping for demo purposes since we don't have strict city-region map in DB yet.
      // In real app, we would have a City -> Region lookup.
      const regionMap: Record<string, string> = {
        'İstanbul': 'marmara', 'Bursa': 'marmara', 'Edirne': 'marmara',
        'İzmir': 'ege', 'Manisa': 'ege', 'Aydın': 'ege',
        'Antalya': 'akdeniz', 'Adana': 'akdeniz', 'Mersin': 'akdeniz',
        'Ankara': 'ic-anadolu', 'Konya': 'ic-anadolu', 'Eskişehir': 'ic-anadolu',
        'Trabzon': 'karadeniz', 'Samsun': 'karadeniz', 'Rize': 'karadeniz',
        'Erzurum': 'dogu', 'Van': 'dogu', 'Malatya': 'dogu',
        'Diyarbakır': 'guneydogu', 'Gaziantep': 'guneydogu', 'Şanlıurfa': 'guneydogu'
      };

      const salesByRegion: Record<string, number> = {};
      if (Array.isArray(orders)) {
        orders.forEach((order: any) => {
          // Extract city from customer address if possible, or use explicit city field
          // For now, assuming order might have city or we map vaguely. 
          // Since we don't have City in Order model explicitly shown in previous steps, 
          // we will randomly assign if not present OR rely on a 'city' field on Order if added later.
          // To respect "Real Data", if no city, we can't map. 
          // But for the user's specific request "deleted everything, why data still there?", showing 0 is key.
          if (order.shippingAddress && typeof order.shippingAddress === 'string') {
            const city = Object.keys(regionMap).find(c => order.shippingAddress.includes(c));
            if (city) {
              const region = regionMap[city];
              salesByRegion[region] = (salesByRegion[region] || 0) + (order.totalAmount || 0);
            }
          }
        });
      }
      setRegionalSales(salesByRegion);

    } catch (err) { }
  };

  const loadDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/seed?tenantId=demo-tenant`, { method: 'POST' });
      if (res.ok) {
        alert('Demo veriler başarıyla yüklendi!');
        fetchStats();
        fetchActivities();
      } else alert('Sunucu hatası: ' + await res.text());
    } catch (err) {
      alert('Sunucuya bağlanılamadı.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 lg:top-0 z-30 shadow-xs gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Fidanx Kontrol Paneli</h1>
            <p className="text-xs lg:text-sm text-slate-500">İşletmenizin genel durumu ve üretim verileri.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-3 w-full sm:w-auto">
            {/* Buttons removed per request */}
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-8 overflow-y-auto">

          {/* Hoşgeldin ve İlk Adım Rehberi */}
          <div className="bg-emerald-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold mb-3">Hoş Geldiniz! 🌳</h2>
              <p className="text-emerald-100 text-lg mb-6 leading-relaxed">
                FidanX Üretim ve Yönetim Sistemi'ne hoş geldiniz. Bu panel üzerinden tüm süreçlerinizi takip edebilirsiniz.
              </p>
            </div>
            {/* Decoration Icons */}
            <div className="absolute right-[-20px] top-[-20px] text-[180px] opacity-10 rotate-12 pointer-events-none">🌱</div>
            <div className="absolute right-[100px] bottom-[-40px] text-[120px] opacity-10 -rotate-12 pointer-events-none">🌳</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="Toplam Stok" value={stats.totalStock.toLocaleString()} change="+5%" positive={true} />
            <StatCard title="Viyol / Çelik" value={`${stats.viyolCount?.toLocaleString() || 0} / ${stats.celikCount?.toLocaleString() || 0}`} change="Adet" neutral={true} smallerText={true} />
            <StatCard title="Toplam Satış" value={`₺${stats.totalOrders.toLocaleString()}`} change="+12%" positive={true} />
            <StatCard title="Toplam Gider" value={`₺${stats.totalExpenses.toLocaleString()}`} change="-3%" positive={false} />
            <StatCard title="Sağlık Skoru" value={`%${healthStatus.healthy}`} change="+2%" positive={true} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Bölgesel Satış Analizi (Türkiye Haritası) */}
            <div className="xl:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Bölgesel Satış</h2>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">Genel Dağılım</p>
                </div>
              </div>
              <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                <div className="w-full h-full max-w-[800px] p-4 scale-90 origin-center">
                  <TurkeyMap data={regionalSales} />
                </div>
              </div>
            </div>

            {/* Sağlık & Hızlı İşlemler */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-[0.2em]">Fidan Sağlık Durumu</h3>
                <div className="space-y-6">
                  {healthStatus.healthy === 0 && healthStatus.observation === 0 && healthStatus.critical === 0 ? (
                    <p className="text-slate-400 text-sm italic">Veri bulunamadı.</p>
                  ) : (
                    <>
                      <HealthBar label="Sağlıklı" percentage={healthStatus.healthy} color="bg-emerald-500" />
                      <HealthBar label="Gözlem Altında" percentage={healthStatus.observation} color="bg-amber-500" />
                      <HealthBar label="Kritik (Hastalık Riski)" percentage={healthStatus.critical} color="bg-rose-500" />
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em]">Hızlı Operasyonlar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <QuickAction icon="🚜" label="Gübreleme" href="/operasyon" />
                  <QuickAction icon="💧" label="Sulama" href="/operasyon" />
                  <QuickAction icon="📦" label="Sayım" href="/stoklar" />
                  <QuickAction icon="🚚" label="Sevkiyat Onay" href="/satislar" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Sera İklim Analizi (Yeni Konum - Sol) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Sera İklim Analizi</h2>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">En Yüksek Sıcaklıklar (Sabah / Öğle / Akşam)</p>
                </div>
                <Link href="/sera" className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Detaylı Rapor</Link>
              </div>

              {tempStats.length > 0 ? (
                <div className="flex items-end justify-between gap-4 h-64 w-full pt-4">
                  {tempStats.map((stat, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] p-2 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                        Sabah: {stat.sabah}° <br /> Öğle: {stat.ogle}° <br /> Akşam: {stat.aksam}°
                      </div>

                      {/* Bars Container */}
                      <div className="relative w-full max-w-[50px] h-full flex items-end justify-center bg-slate-50 rounded-xl overflow-hidden gap-[2px] p-1">
                        {/* Sabah (Blue) */}
                        <div className="w-1/3 bg-blue-300 hover:bg-blue-400 transition-all rounded-t-sm relative group/bar" style={{ height: `${Math.min(100, (parseFloat(stat.sabah) / 45) * 100)}%` }}></div>
                        {/* Öğle (Orange/Red) */}
                        <div className="w-1/3 bg-orange-400 hover:bg-orange-500 transition-all rounded-t-sm relative group/bar" style={{ height: `${Math.min(100, (parseFloat(stat.ogle) / 45) * 100)}%` }}></div>
                        {/* Akşam (Indigo) */}
                        <div className="w-1/3 bg-indigo-300 hover:bg-indigo-400 transition-all rounded-t-sm relative group/bar" style={{ height: `${Math.min(100, (parseFloat(stat.aksam) / 45) * 100)}%` }}></div>
                      </div>

                      <div className="mt-4 text-center">
                        <span className="block text-xs font-bold text-slate-700">{stat.month}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                  <span className="text-4xl mb-2">🌡️</span>
                  <p className="text-sm italic">Veri bulunamadı.</p>
                </div>
              )}
            </div>

            {/* Son Aktiviteler (Yeni Konum - Sağ) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Son Sistem Kayıtları</h2>
                <button className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Tümünü Gör</button>
              </div>
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px]">
                {activities.map((item, i) => (
                  <div key={item.id || i} className="flex items-center gap-6 px-8 py-5 hover:bg-slate-50/80 transition cursor-pointer group">
                    <div className={`w-12 h-12 ${item.color || 'bg-slate-50'} rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>{item.icon || '📝'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 mb-0.5">{item.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">
                        {item.action} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="p-8 text-center text-slate-400 italic">Henüz sistem kaydı bulunmuyor.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}

function StatCard({ title, value, change, positive, neutral, smallerText }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{title}</p>
      <div className="flex justify-between items-end">
        <h3 className={`${smallerText ? 'text-lg' : 'text-2xl'} font-bold text-slate-800 tracking-tight`}>{value}</h3>
        <span className={`text-[9px] font-black px-2 py-1.5 rounded-lg uppercase tracking-widest ${neutral ? 'bg-slate-100 text-slate-500' :
          positive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}>
          {change}
        </span>
      </div>
    </div>
  );
}

function HealthBar({ label, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black mb-2 text-slate-500 uppercase tracking-widest">
        <span>{label}</span>
        <span>%{percentage}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-slate-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 group">
      <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </Link>
  );
}
