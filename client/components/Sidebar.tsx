"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Kontrol Paneli', path: '/', icon: '📊' },
        { name: 'Üretim Takibi', path: '/uretim', icon: '🚜' },
        { name: 'Operasyon & Hareket', path: '/hareketler', icon: '🚚' },
        { name: 'Günlük Bahçe İşleri', path: '/operasyon', icon: '🌻' },
        { name: 'Reçete Yönetimi', path: '/receteler', icon: '🧪' },
        { name: 'Stok Yönetimi', path: '/stoklar', icon: '🌱' },
        { name: 'Satınalma', path: '/satinalma', icon: '🛒' },
        { name: 'Satış & CRM', path: '/satislar', icon: '💰' },
        { name: 'Finans & Giderler', path: '/finans', icon: '💎' },
        { name: 'Maliyet Analizi', path: '/analizler/maliyetler', icon: '📈' },
        { name: 'Gelişmiş Raporlar', path: '/raporlar', icon: '📑' },
        { name: 'Sera Yönetimi', path: '/sera', icon: '🌡️' },
        { name: 'Ayarlar', path: '/ayarlar', icon: '⚙️' },
        { name: 'Mobil Tarayıcı', path: '/scanner', icon: '📱' },
    ];

    return (
        <aside className="hidden lg:flex sticky top-0 left-0 h-screen z-40 w-64 bg-[#1e293b] text-slate-300 flex-col border-r border-slate-700 shrink-0">
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <span className="text-emerald-500 font-black text-3xl leading-none">f</span>
                        <span className="text-white font-bold text-2xl tracking-tighter">idan</span>
                        <span className="text-emerald-400 font-black text-3xl leading-none">X</span>
                    </div>
                    <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-bold self-end mb-1">PRO</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium group ${isActive
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profile Area */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4 p-2 bg-slate-800/40 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg shadow-inner">A</div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">Admin Kullanıcı</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Süper Yetkili</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
