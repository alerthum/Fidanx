"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Kontrol Paneli', path: '/', icon: '📊' },
        { name: 'Stok Yönetimi', path: '/stoklar', icon: '🌱' },
        { name: 'Firma Yönetimi', path: '/firmalar', icon: '🏢' },
        { name: 'Satışlar', path: '/satislar', icon: '💰' },
        { name: 'Üretim Takibi', path: '/uretim', icon: '🚜' },
        { name: 'Analizler', path: '/analizler', icon: '📈' },
        { name: 'Destek & Feedback', path: '/destek', icon: '💬' },
        { name: 'Ayarlar', path: '/ayarlar', icon: '⚙️' },
    ];

    return (
        <div className="w-64 bg-[#1e293b] text-slate-300 flex flex-col sticky top-0 h-screen z-40 border-r border-slate-700">
            {/* Logo Alanı */}
            <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-emerald-500">FIDANX</span>
                    <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded uppercase">v1.5</span>
                </h2>
            </div>

            {/* Navigasyon */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium group ${isActive
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Alt Alan (Profil & Çıkış) */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4 p-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg">A</div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">Admin Kullanıcı</p>
                        <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-tighter">Süper Yetkili</p>
                    </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-slate-700 hover:border-rose-800">
                    <span>🚪</span> GÜVENLİ ÇIKIŞ
                </button>
            </div>
        </div>
    );
}
