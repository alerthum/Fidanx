"use client";
import React, { useState, useEffect } from "react";
// import ReactQrcodeScanner from "react-qr-scanner"; // We will simulate this to avoid complex dependencies for now

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [manualInput, setManualInput] = useState('');

    const handleScan = (data: string | null) => {
        if (data) {
            setScanResult(data);
            setStatus('success');
            // Play success sound
            const audio = new Audio('/success.mp3');
            audio.play().catch(() => { });
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        setStatus('error');
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScan(manualInput);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900 to-slate-900 animate-pulse"></div>
            </div>

            <div className="z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl flex flex-col items-center">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Barkod Tarayıcı</h1>
                    <p className="text-slate-300 text-sm">Ürün veya stok kartını kameraya okutun.</p>
                </div>

                <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden mb-8 border-4 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    {/* Scanner Simulation / Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-emerald-500 text-xs font-mono animate-pulse">KAMERA AKTİF</p>
                    </div>

                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-[scan_2s_infinite]"></div>

                    {/* Corner Markers */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg"></div>
                </div>

                {/* Manual Input */}
                <form onSubmit={handleManualSubmit} className="w-full relative mb-6">
                    <input
                        type="text"
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        placeholder="Barkod No Girin..."
                        className="w-full bg-slate-800/50 border border-slate-600 text-white px-5 py-4 rounded-xl outline-none focus:border-emerald-500 transition placeholder:text-slate-500 font-mono text-center tracking-widest text-lg"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 p-2 hover:bg-emerald-500/10 rounded-lg">
                        ➜
                    </button>
                </form>

                {/* Status / Result */}
                {scanResult ? (
                    <div className="w-full bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 text-center animate-bounce-in">
                        <p className="text-emerald-300 text-xs font-bold uppercase mb-1">Tespit Edildi</p>
                        <p className="text-white font-mono text-xl font-black tracking-wider">{scanResult}</p>
                        <div className="mt-3 flex gap-2">
                            <a href={`/stoklar?search=${scanResult}`} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-500 transition">Stokta Gör</a>
                            <button onClick={() => setScanResult(null)} className="px-3 bg-white/10 text-white rounded-lg hover:bg-white/20">↺</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition text-slate-400 hover:text-white">
                            <span className="text-2xl">📸</span>
                            <span className="text-[10px] font-bold uppercase">Fotoğraf</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition text-slate-400 hover:text-white">
                            <span className="text-2xl">⚡</span>
                            <span className="text-[10px] font-bold uppercase">Flaş</span>
                        </button>
                    </div>
                )}

                <div className="mt-8">
                    <a href="/" className="text-slate-500 hover:text-white text-sm transition flex items-center gap-2">
                        ← Ana Sayfaya Dön
                    </a>
                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
