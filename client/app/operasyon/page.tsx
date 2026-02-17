"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function OperationsPage() {
    const [activeTab, setActiveTab] = useState('app'); // 'app' | 'maintenance' | 'measure'
    const [logs, setLogs] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({
        locations: [],
        recipeId: '',
        expenseType: '',
        description: '',
        cost: 0,
        measurements: {},
        operationDate: new Date().toISOString().split('T')[0]
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Settings
            const setRes = await fetch(`${API_URL}/tenants/demo-tenant`);
            const setData = await setRes.json();
            if (setData.settings) setSettings(setData.settings);

            // Fetch Recipes
            const recRes = await fetch(`${API_URL}/recipes?tenantId=demo-tenant`);
            setRecipes(await recRes.json());

            // Fetch Activity Logs
            fetchLogs();
        } catch (err) { console.error(err); }
    };

    const fetchLogs = async () => {
        const res = await fetch(`${API_URL}/activity?tenantId=demo-tenant`);
        const data = await res.json();
        setLogs(data);
    };

    const handleLocationToggle = (loc: string) => {
        const current = formData.locations || [];
        if (current.includes(loc)) {
            setFormData({ ...formData, locations: current.filter((l: string) => l !== loc) });
        } else {
            setFormData({ ...formData, locations: [...current, loc] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let title = '';
        let icon = '';
        let color = '';
        let details = '';

        if (activeTab === 'app') {
            const recipe = recipes.find(r => r.id === formData.recipeId);
            title = recipe ? `Uygulama: ${recipe.name}` : 'Reçetesiz Uygulama';
            icon = '💧';
            color = 'bg-blue-50 text-blue-600 border-blue-200';
            details = `Kullanılan Reçete: ${recipe?.name || '-'}`;
        } else if (activeTab === 'maintenance') {
            title = `Bakım: ${formData.expenseType || 'Genel'}`;
            icon = '🚜';
            color = 'bg-amber-50 text-amber-600 border-amber-200';
            details = formData.description;
        }

        const payload = {
            action: activeTab.toUpperCase(),
            title,
            icon,
            color,
            details,
            locations: formData.locations,
            data: formData, // Store full form data
            cost: parseFloat(formData.cost) || 0,
            timestamp: formData.operationDate ? new Date(formData.operationDate).toISOString() : new Date().toISOString(),
            date: formData.operationDate || new Date().toISOString().split('T')[0]
        };

        try {
            const res = await fetch(`${API_URL}/activity?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setFormData({ locations: [], recipeId: '', expenseType: '', description: '', cost: 0, measurements: {}, operationDate: new Date().toISOString().split('T')[0] });
                fetchLogs();
                // Optionally trigger cost calculation backend task here
            } else {
                alert('Hata oluştu.');
            }
        } catch (err) {
            alert('Sunucu hatası.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-30 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Günlük Bahçe İşleri & Operasyon</h1>
                    <p className="text-sm text-slate-500 font-medium">Sera ve bahçelerde yapılan işlemleri kayıt altına alın.</p>
                </header>

                <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: ACTION FORM */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex border-b border-slate-200">
                                <button
                                    onClick={() => setActiveTab('app')}
                                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition ${activeTab === 'app' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    💧 Uygulama
                                </button>
                                <button
                                    onClick={() => setActiveTab('maintenance')}
                                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition ${activeTab === 'maintenance' ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    🚜 Bakım
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* DATE PICKER */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">📅 İşlem Tarihi</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-bold bg-slate-50"
                                            value={formData.operationDate}
                                            onChange={e => setFormData({ ...formData, operationDate: e.target.value })}
                                        />
                                    </div>

                                    {/* LOCATION SELECTOR */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Uygulama Konumu (Çoklu Seçim)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(settings.locations || ['Sera 1', 'Sera 2', 'Açık Alan']).map((loc: string) => (
                                                <button
                                                    type="button"
                                                    key={loc}
                                                    onClick={() => handleLocationToggle(loc)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${formData.locations.includes(loc) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    {formData.locations.includes(loc) && '✓ '} {loc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CONDITIONAL FIELDS */}
                                    {activeTab === 'app' && (
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reçete / Karışım Seçin</label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-sm bg-slate-50 font-medium"
                                                value={formData.recipeId}
                                                onChange={e => setFormData({ ...formData, recipeId: e.target.value })}
                                            >
                                                <option value="">Seçiniz...</option>
                                                {recipes.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-2 italic">Seçilen reçetenin maliyeti ve stok düşümü otomatik yapılacaktır.</p>
                                        </div>
                                    )}

                                    {activeTab === 'maintenance' && (
                                        <>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">İşlem Tipi / Gider Kalemi</label>
                                                <select
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm bg-slate-50 font-medium"
                                                    value={formData.expenseType}
                                                    onChange={e => setFormData({ ...formData, expenseType: e.target.value })}
                                                >
                                                    <option value="">Seçiniz...</option>
                                                    {(settings.expenseTypes || ['İşçilik', 'Enerji']).map((t: string) => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Açıklama</label>
                                                <textarea
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-500 text-sm"
                                                    rows={3}
                                                    placeholder="Yapılan işlem detayları..."
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ek Maliyet (TL)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-slate-500 text-sm font-bold"
                                            placeholder="0.00"
                                            value={formData.cost || ''}
                                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-xl font-bold shadow-lg text-white transition active:scale-95 text-lg uppercase tracking-wide
                                            ${activeTab === 'app' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                                                'bg-amber-600 hover:bg-amber-700 shadow-amber-200'}`}
                                    >
                                        {isLoading ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: HISTORY */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                            <div className="p-6 border-b border-slate-200 bg-slate-50">
                                <h3 className="font-bold text-slate-700">Son İşlem Kayıtları</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0">
                                {logs.length === 0 ? (
                                    <div className="p-10 text-center text-slate-400 italic">Henüz kayıt bulunamadı.</div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest sticky top-0">
                                            <tr>
                                                <th className="px-6 py-4">Tarih</th>
                                                <th className="px-6 py-4">İşlem</th>
                                                <th className="px-6 py-4">Konum</th>
                                                <th className="px-6 py-4">Detay</th>
                                                <th className="px-6 py-4 text-right">Maliyet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {logs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                                                        {new Date(log.date || log.timestamp).toLocaleString('tr-TR')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${log.color || 'bg-slate-100'}`}>
                                                                {log.icon || '📝'}
                                                            </span>
                                                            <span className="font-bold text-slate-700">{log.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {log.locations?.map((l: string) => (
                                                            <span key={l} className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded mr-1 font-bold">{l}</span>
                                                        ))}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                                        {log.details || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                                                        {log.cost ? `${log.cost} ₺` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
