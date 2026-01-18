"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: 'Kontrol Paneli', path: '/', icon: '📊' },
        { name: 'Üretim Takibi', path: '/uretim', icon: '🚜' },
        { name: 'Reçete Yönetimi', path: '/receteler', icon: '🧪' },
        { name: 'Stok Yönetimi', path: '/stoklar', icon: '🌱' },
        { name: 'Firma Yönetimi', path: '/firmalar', icon: '🏢' },
        { name: 'Satışlar', path: '/satislar', icon: '💰' },
        { name: 'Analizler', path: '/analizler', icon: '📈' },
        { name: 'Destek & Feedback', path: '/destek', icon: '💬' },
        { name: 'Ayarlar', path: '/ayarlar', icon: '⚙️' },
    ];

    return (
        <>
            {/* Mobile Top Header - Only visible on small screens */}
            <div className="lg:hidden bg-[#1e293b] text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold text-xl tracking-tighter">FIDANX</span>
                    <span className="text-[9px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">v1.5</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                    aria-label="Toggle Menu"
                >
                    <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {/* Mobile Overlay - Darkens background when menu is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Drawer */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen z-[70] lg:z-40
                w-64 bg-[#1e293b] text-slate-300 flex flex-col border-r border-slate-700 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Area - Desktop Only */}
                <div className="p-6 border-b border-slate-700/50 hidden lg:block">
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="text-emerald-500">FIDANX</span>
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded uppercase">v1.5</span>
                    </h2>
                </div>

                {/* Mobile Specific Header inside Drawer (Optional, for better UX) */}
                <div className="p-6 border-b border-slate-700/50 lg:hidden flex justify-between items-center bg-slate-900/30">
                    <span className="text-emerald-500 font-bold text-xl">Menü</span>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 text-xl">✕</button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsOpen(false)}
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
        </>
    );
}
