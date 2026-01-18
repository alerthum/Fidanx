"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TurkeyMap from '@/components/TurkeyMap';
import Link from 'next/link';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

  const loadDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/seed?tenantId=demo-tenant`, { method: 'POST' });
      if (res.ok) alert('Demo veriler başarıyla yüklendi!');
      else alert('Sunucu hatası: ' + await res.text());
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
            <button
              onClick={loadDemo}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Yükleniyor...' : '⚡ Demo Veri'}
            </button>
            <Link href="/stoklar" className="flex-1 sm:flex-none bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-emerald-700 transition active:scale-95 text-center whitespace-nowrap">
              + Yeni Stok
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-8 overflow-y-auto">

          {/* Hoşgeldin ve İlk Adım Rehberi */}
          <div className="bg-emerald-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold mb-3">Hoş Geldiniz! 🌳</h2>
              <p className="text-emerald-100 text-lg mb-6 leading-relaxed">
                Sistemi kullanmaya başlamak için önce <span className="font-bold text-white underline decoration-emerald-400">Ana Ağaçlarınızı</span> (Damızlık Ağaçlar) sisteme girmeniz gerekmektedir. Daha sonra bu ağaçlardan aldığınız dallar ile üretimi başlatabilirsiniz.
              </p>
              <div className="flex gap-4">
                <Link href="/stoklar" className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition">
                  Hemen Ana Ağaç Girişi Yap
                </Link>
                <button onClick={loadDemo} className="bg-emerald-800/50 text-emerald-100 px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 transition border border-emerald-700">
                  Nasıl Çalışır? İncele
                </button>
              </div>
            </div>
            {/* Decoration Icons */}
            <div className="absolute right-[-20px] top-[-20px] text-[180px] opacity-10 rotate-12 pointer-events-none">🌱</div>
            <div className="absolute right-[100px] bottom-[-40px] text-[120px] opacity-10 -rotate-12 pointer-events-none">🌳</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Toplam Stok" value="42,850" change="+12%" positive={true} />
            <StatCard title="Beklenen Satış" value="₺840K" change="+18%" positive={true} />
            <StatCard title="Sağlık Skoru" value="%94" change="+2%" positive={true} />
            <StatCard title="Aktif Personel" value="12" change="Stabil" neutral={true} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Türkiye Haritası Alanı */}
            <div className="xl:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 w-full min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Bölgesel Satış Analizi</h2>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">Türkiye Geneli Verim Raporu</p>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest">Canlı Veri</span>
              </div>

              <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                {/* Map Integration */}
                <div className="w-full h-full max-w-[800px] p-4">
                  <TurkeyMap />
                </div>
              </div>
            </div>

            {/* Sağlık & Hızlı İşlemler */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-[0.2em]">Fidan Sağlık Durumu</h3>
                <div className="space-y-6">
                  <HealthBar label="Sağlıklı" percentage={65} color="bg-emerald-500" />
                  <HealthBar label="Gözlem Altında" percentage={25} color="bg-amber-500" />
                  <HealthBar label="Kritik (Hastalık Riski)" percentage={10} color="bg-rose-500" />
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em]">Hızlı Operasyonlar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <QuickAction icon="🚜" label="Gübreleme" />
                  <QuickAction icon="💧" label="Sulama" />
                  <QuickAction icon="📦" label="Sayım" />
                  <QuickAction icon="🚚" label="Sevkiyat" />
                </div>
              </div>
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
            <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Son Sistem Kayıtları</h2>
              <button className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Tümünü Gör</button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { title: 'İstanbul Sevkiyatı Tamamlandı', time: '1 saat önce', icon: '🚚', color: 'bg-blue-50 text-blue-600' },
                { title: 'Zeytin Fidanı Dikimi - Blok A', time: '3 saat önce', icon: '🌱', color: 'bg-emerald-50 text-emerald-600' },
                { title: 'Gübreleme Operasyonu - Marmara', time: '5 saat önce', icon: '🚜', color: 'bg-orange-50 text-orange-600' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 px-8 py-5 hover:bg-slate-50/80 transition cursor-pointer group">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 mb-0.5">{item.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">{item.time}</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, positive, neutral }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{title}</p>
      <div className="flex justify-between items-end">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
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

function QuickAction({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-slate-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 group">
      <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
