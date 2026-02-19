"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/Sidebar';

export default function AyarlarPage() {
    const { theme, setTheme } = useTheme();
    const [categories, setCategories] = useState<string[]>(['Meyve', 'Süs', 'Endüstriyel']);
    const [productionStages, setProductionStages] = useState<string[]>(['TEPSİ', 'KÜÇÜK_SAKSI', 'BÜYÜK_SAKSI', 'SATIŞA_HAZIR']);
    const [locations, setLocations] = useState<string[]>(['Sera 1', 'Sera 2', 'Açık Alan', 'Depo']);
    const [users, setUsers] = useState<any[]>([
        { name: 'Admin Kullanıcı', role: 'Süper Yetkili', email: 'admin@fidanx.com' }
    ]);
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Personel' });
    const [newLocation, setNewLocation] = useState('');
    const [expenseTypes, setExpenseTypes] = useState<string[]>(['Enerji', 'İşçilik', 'Nakliye', 'Bakım', 'Dikim', 'Gübre', 'İlaç']);
    const [measurementParams, setMeasurementParams] = useState<string[]>(['Sıcaklık', 'Nem']);
    const [newExpenseType, setNewExpenseType] = useState('');
    const [newMeasurementParam, setNewMeasurementParam] = useState('');
    const [backups, setBackups] = useState<any[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupName, setBackupName] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

    useEffect(() => {
        fetchSettings();
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const res = await fetch(`${API_URL}/seed/backups?tenantId=demo-tenant`);
            const data = await res.json();
            setBackups(data);
        } catch (err) { }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/tenants/demo-tenant`);
            const data = await res.json();
            if (data.settings?.categories) setCategories(data.settings.categories);
            if (data.settings?.productionStages) setProductionStages(data.settings.productionStages);
            if (data.settings?.users) setUsers(data.settings.users);
            if (data.settings?.locations) setLocations(data.settings.locations);
            if (data.settings?.expenseTypes) setExpenseTypes(data.settings.expenseTypes);
            if (data.settings?.measurementParams) setMeasurementParams(data.settings.measurementParams);
        } catch (err) { }
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers([...users, newUser]);
        setNewUser({ name: '', email: '', role: 'Personel' });
        setIsUserModalOpen(false);
    };

    const handleRemoveUser = (email: string) => {
        setUsers(users.filter(u => u.email !== email));
    };

    const handleClearData = async () => {
        const password = prompt('Sistemi temizlemek için yönetici parolasını girin:');
        if (password === 'fidanx') {
            if (confirm('Tüm üretim ve stok verileri silinecektir. Emin misiniz?')) {
                try {
                    const res = await fetch(`${API_URL}/seed/clear?tenantId=demo-tenant`, { method: 'DELETE' });
                    if (res.ok) alert('Sistem sıfırlandı.');
                    else alert('Sunucu hatası.');
                } catch (err) {
                    alert('Sunucuya bağlanılamadı.');
                }
            }
        } else if (password !== null) {
            alert('Hatalı parola!');
        }
    };

    const handleSaveSettings = async (customCategories?: string[], customStages?: string[], customUsers?: any[], customLocations?: string[], customExpenseTypes?: string[], customMeasurementParams?: string[]) => {
        setIsSaving(true);
        try {
            const payload = {
                categories: customCategories || categories,
                users: customUsers || users,
                productionStages: customStages || productionStages,
                locations: customLocations || locations,
                expenseTypes: customExpenseTypes || expenseTypes,
                measurementParams: customMeasurementParams || measurementParams
            };

            const res = await fetch(`${API_URL}/tenants/demo-tenant/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) alert('Kaydetme başarısız: ' + await res.text());
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddStage = () => {
        const input = document.getElementById('new-stage-input') as HTMLInputElement;
        if (input.value) {
            const newList = [...productionStages, input.value];
            setProductionStages(newList);
            input.value = '';
            handleSaveSettings(undefined, newList);
        }
    };

    const handleRemoveStage = (s: string) => {
        const newList = productionStages.filter(x => x !== s);
        setProductionStages(newList);
        handleSaveSettings(undefined, newList);
    };

    const handleAddCategory = () => {
        if (newCategory) {
            const newList = [...categories, newCategory];
            setCategories(newList);
            setNewCategory('');
            handleSaveSettings(newList);
        }
    };

    const handleRemoveCategory = (c: string) => {
        const newList = categories.filter(x => x !== c);
        setCategories(newList);
        handleSaveSettings(newList);
    };



    const handleAddLocation = () => {
        if (newLocation) {
            const newList = [...locations, newLocation];
            setLocations(newList);
            setNewLocation('');
            handleSaveSettings(undefined, undefined, undefined, newList);
        }
    };

    const handleRemoveLocation = (l: string) => {
        const newList = locations.filter(x => x !== l);
        setLocations(newList);
        handleSaveSettings(undefined, undefined, undefined, newList);
    };

    const handleAddExpenseType = () => {
        if (newExpenseType) {
            const newList = [...expenseTypes, newExpenseType];
            setExpenseTypes(newList);
            setNewExpenseType('');
            handleSaveSettings(undefined, undefined, undefined, undefined, newList);
        }
    };

    const handleRemoveExpenseType = (e: string) => {
        const newList = expenseTypes.filter(x => x !== e);
        setExpenseTypes(newList);
        handleSaveSettings(undefined, undefined, undefined, undefined, newList);
    };

    const handleAddMeasurementParam = () => {
        if (newMeasurementParam) {
            const newList = [...measurementParams, newMeasurementParam];
            setMeasurementParams(newList);
            setNewMeasurementParam('');
            handleSaveSettings(undefined, undefined, undefined, undefined, undefined, newList);
        }
    };

    const handleRemoveMeasurementParam = (m: string) => {
        const newList = measurementParams.filter(x => x !== m);
        setMeasurementParams(newList);
        handleSaveSettings(undefined, undefined, undefined, undefined, undefined, newList);
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const name = backupName || `yedek_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;
            const res = await fetch(`${API_URL}/seed/backup/save?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const result = await res.json();
            if (res.ok) {
                alert(`✅ Yedek başarıyla alındı!\n\n📦 İsim: ${result.name}\n📄 Toplam Kayıt: ${result.totalDocuments}`);
                setBackupName('');
                fetchBackups();
            } else {
                alert('Yedek oluşturulurken hata oluştu.');
            }
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleDownloadBackup = async () => {
        try {
            const res = await fetch(`${API_URL}/seed/backup?tenantId=demo-tenant`);
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fidanx_yedek_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Yedek indirilemedi.');
        }
    };

    const handleRestoreFromBackup = async (backupNameToRestore: string) => {
        const password = prompt('Geri yükleme için yönetici parolasını girin:');
        if (password !== 'fidanx') {
            if (password !== null) alert('Hatalı parola!');
            return;
        }
        if (!confirm(`⚠️ "${backupNameToRestore}" yedeği geri yüklenecek.\n\nMevcut tüm veriler silinip yerine yedek verileri yazılacaktır.\n\nDevam etmek istiyor musunuz?`)) return;

        setIsRestoring(true);
        try {
            const res = await fetch(`${API_URL}/seed/restore?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupName: backupNameToRestore }),
            });
            const result = await res.json();
            if (result.error) {
                alert('Hata: ' + result.error);
            } else {
                alert(`✅ Yedek başarıyla geri yüklendi!\n\n📄 Toplam Geri Yüklenen: ${result.totalRestored} kayıt`);
                fetchSettings();
            }
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleRestoreFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const password = prompt('Geri yükleme için yönetici parolasını girin:');
        if (password !== 'fidanx') {
            if (password !== null) alert('Hatalı parola!');
            return;
        }
        if (!confirm('⚠️ Dosyadan geri yükleme yapılacak.\n\nMevcut tüm veriler silinip yerine dosyadaki veriler yazılacaktır.\n\nDevam etmek istiyor musunuz?')) return;

        setIsRestoring(true);
        try {
            const text = await file.text();
            const backupData = JSON.parse(text);
            const res = await fetch(`${API_URL}/seed/restore?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupData }),
            });
            const result = await res.json();
            if (result.error) {
                alert('Hata: ' + result.error);
            } else {
                alert(`✅ Dosyadan geri yükleme başarılı!\n\n📄 Toplam Geri Yüklenen: ${result.totalRestored} kayıt`);
                fetchSettings();
            }
        } catch (err) {
            alert('Dosya okunamadı veya sunucuya bağlanılamadı.');
        } finally {
            setIsRestoring(false);
            e.target.value = '';
        }
    };

    const handleDeleteBackup = async (name: string) => {
        if (!confirm(`"${name}" yedeği silinecek. Emin misiniz?`)) return;
        try {
            await fetch(`${API_URL}/seed/backups/${encodeURIComponent(name)}?tenantId=demo-tenant`, { method: 'DELETE' });
            fetchBackups();
        } catch (err) {
            alert('Yedek silinemedi.');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sistem Ayarları</h1>
                        <p className="text-sm text-slate-500 font-medium">Kullanıcı yönetimi, roller ve parametreler.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {isSaving && <span className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">Buluta Yazılıyor...</span>}
                        <button
                            onClick={() => handleSaveSettings()}
                            disabled={isSaving}
                            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition active:scale-95 disabled:opacity-50"
                        >
                            ✓ Değişiklikleri Kaydet
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Tema Ayarları */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 xl:col-span-2 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.2em] dark:text-slate-400">Görünüm & Tema</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">Uygulamanın renk temasını seçin. (Bazı alanlar henüz Beta)</p>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
                                {['light', 'dark', 'system'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${theme === t
                                            ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >
                                        {t === 'light' ? '☀️ Aydınlık' : t === 'dark' ? '🌙 Karanlık' : '💻 Sistem'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Kullanıcı & Erişim Yönetimi</h3>
                            <button
                                onClick={() => setIsUserModalOpen(true)}
                                className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition"
                            >
                                + Yeni Kullanıcı Ekle
                            </button>
                        </div>
                        <div className="flex-1">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Kullanıcı Bilgisi</th>
                                        <th className="px-6 py-3">Yetki Seviyesi</th>
                                        <th className="px-6 py-3 text-right">Eylem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user, i) => (
                                        <tr key={i} className="hover:bg-slate-50/80 transition group">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 leading-tight">{user.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${user.role === 'Süper Yetkili' || user.role === 'Admin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRemoveUser(user.email)}
                                                    className="text-slate-300 hover:text-rose-500 transition-colors font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    Kaldır
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400 italic text-xs">Henüz kullanıcı tanımlanmadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Parametreler */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Üretim Safhaları (Dinamik Şaşırtma)</h3>
                            <div className="flex flex-wrap gap-2">
                                {productionStages.map(s => (
                                    <span key={s} className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2 group hover:border-emerald-300 transition-all">
                                        {s}
                                        <button onClick={() => handleRemoveStage(s)} className="text-emerald-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <input
                                    id="new-stage-input"
                                    type="text"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 shadow-sm transition"
                                    placeholder="Örn: 1. Şaşırtma"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddStage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleAddStage}
                                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition active:scale-95 shadow-md shadow-emerald-100"
                                >
                                    Ekle
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">Taşıma (Şaşırtma) butonuna basıldığında bu safhalar sırasıyla önerilecektir.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Stok Kategorileri</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <span key={c} className="bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold border border-slate-100 flex items-center gap-2 group hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                                        {c}
                                        <button onClick={() => handleRemoveCategory(c)} className="text-slate-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 shadow-sm transition"
                                    placeholder="Örn: Zeytin Fidanı"
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition active:scale-95"
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Üretim Konumları (Sera/Bahçe)</h3>
                        <div className="flex flex-wrap gap-2">
                            {locations.map(l => (
                                <span key={l} className="bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-xs font-bold border border-amber-100 flex items-center gap-2 group hover:border-amber-300 transition-all">
                                    {l}
                                    <button onClick={() => handleRemoveLocation(l)} className="text-amber-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <input
                                type="text"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLocation(); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-500 shadow-sm transition"
                                placeholder="Örn: Sera 1, Bahçe A, Depo"
                            />
                            <button
                                onClick={handleAddLocation}
                                className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition active:scale-95"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Gider Kalemleri</h3>
                        <div className="flex flex-wrap gap-2">
                            {expenseTypes.map(e => (
                                <span key={e} className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold border border-indigo-100 flex items-center gap-2 group hover:border-indigo-300 transition-all">
                                    {e}
                                    <button onClick={() => handleRemoveExpenseType(e)} className="text-indigo-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <input
                                type="text"
                                value={newExpenseType}
                                onChange={(e) => setNewExpenseType(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddExpenseType(); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 shadow-sm transition"
                                placeholder="Örn: Nakliye, İşçilik"
                            />
                            <button
                                onClick={handleAddExpenseType}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition active:scale-95"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Ortam Ölçüm Parametreleri</h3>
                        <div className="flex flex-wrap gap-2">
                            {measurementParams.map(m => (
                                <span key={m} className="bg-sky-50 text-sky-700 px-3 py-2 rounded-xl text-xs font-bold border border-sky-100 flex items-center gap-2 group hover:border-sky-300 transition-all">
                                    {m}
                                    <button onClick={() => handleRemoveMeasurementParam(m)} className="text-sky-300 hover:text-rose-500 transition font-black text-sm">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <input
                                type="text"
                                value={newMeasurementParam}
                                onChange={(e) => setNewMeasurementParam(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMeasurementParam(); }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500 shadow-sm transition"
                                placeholder="Örn: CO2, Toprak Nemi"
                            />
                            <button
                                onClick={handleAddMeasurementParam}
                                className="bg-sky-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition active:scale-95"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>

                    {/* ═══ Yedekleme & Geri Yükleme ═══ */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200 shadow-sm overflow-hidden relative">
                            <div className="absolute right-[-10px] top-[-10px] text-[80px] opacity-[0.06] pointer-events-none">💾</div>
                            <h3 className="font-black text-emerald-800 uppercase text-[10px] tracking-[0.2em] mb-4">Veritabanı Yedek Al</h3>
                            <p className="text-xs text-emerald-700 font-medium mb-6">Tüm verilerin anlık bir kopyasını oluşturun. Yedekler Firestore'da saklanır ve istediğiniz zaman geri yüklenebilir.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={backupName}
                                    onChange={(e) => setBackupName(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-emerald-200 text-sm outline-none focus:border-emerald-500 shadow-sm transition bg-white/80"
                                    placeholder="Yedek adı (boş bırakılırsa otomatik)"
                                />
                                <button
                                    onClick={handleBackup}
                                    disabled={isBackingUp}
                                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isBackingUp ? '⏳ Yedekleniyor...' : '💾 Yedek Al'}
                                </button>
                                <button
                                    onClick={handleDownloadBackup}
                                    className="bg-white text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition active:scale-95 shadow-sm whitespace-nowrap"
                                >
                                    ⬇ JSON İndir
                                </button>
                            </div>
                        </div>

                        {/* Kayıtlı Yedekler Listesi */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.2em]">Kayıtlı Yedekler</h3>
                                <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{backups.length} Yedek</span>
                            </div>
                            {backups.length > 0 ? (
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">Yedek Adı</th>
                                            <th className="px-6 py-3">Tarih</th>
                                            <th className="px-6 py-3 text-center">Kayıt Sayısı</th>
                                            <th className="px-6 py-3 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {backups.map((b, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-700 leading-tight text-xs">{b.name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-500">
                                                        {b.savedAt?._seconds
                                                            ? new Date(b.savedAt._seconds * 1000).toLocaleString('tr-TR')
                                                            : b.backupDate
                                                                ? new Date(b.backupDate).toLocaleString('tr-TR')
                                                                : '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[9px] font-black border border-emerald-100">
                                                        {b.totalDocuments} kayıt
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleRestoreFromBackup(b.name)}
                                                            disabled={isRestoring}
                                                            className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition text-[10px] font-black uppercase tracking-widest border border-amber-200 disabled:opacity-50"
                                                        >
                                                            {isRestoring ? '⏳' : '↩ Geri Yükle'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBackup(b.name)}
                                                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-rose-200"
                                                        >
                                                            ✕ Sil
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-12 text-center text-slate-400 italic text-xs">
                                    Henüz kayıtlı yedek bulunmuyor.
                                </div>
                            )}
                        </div>

                        {/* Dosyadan Geri Yükleme */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 shadow-sm overflow-hidden relative">
                            <div className="absolute right-[-10px] top-[-10px] text-[80px] opacity-[0.06] pointer-events-none">📂</div>
                            <h3 className="font-black text-amber-800 uppercase text-[10px] tracking-[0.2em] mb-2">Dosyadan Geri Yükle</h3>
                            <p className="text-xs text-amber-700 font-medium mb-4">Daha önce indirdiğiniz JSON yedek dosyasından geri yükleme yapın.</p>
                            <label className="relative cursor-pointer inline-flex items-center gap-2 bg-white text-amber-700 border border-amber-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95">
                                <span>{isRestoring ? '⏳ Yükleniyor...' : '📂 JSON Dosyası Seç'}</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleRestoreFromFile}
                                    disabled={isRestoring}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="font-black text-rose-800 uppercase text-[10px] tracking-[0.2em] mb-2">Veritabanını Sıfırla</h3>
                            <p className="text-xs text-rose-600 font-medium">Tüm üretim, stok ve analiz verileri kalıcı olarak silinecektir.</p>
                        </div>
                        <button
                            onClick={handleClearData}
                            className="relative z-10 bg-white text-rose-600 border border-rose-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            SİSTEMİ TEMİZLE
                        </button>
                        {/* Warning Decoration */}
                        <div className="absolute right-[-20px] top-[-20px] text-[100px] opacity-5 pointer-events-none grayscale">⚠️</div>
                    </div>

                </div>

                {/* User Creation Modal */}
                {
                    isUserModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Yeni Kullanıcı Hesabı</h3>
                                <form onSubmit={handleAddUser} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tam Adı</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition"
                                            placeholder="Örn: Ahmet Yılmaz"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">E-Posta Adresi</label>
                                        <input
                                            required
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition"
                                            placeholder="ahmet@fidanx.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Erişim Yetkisi</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm transition appearance-none bg-slate-50"
                                        >
                                            <option value="Admin">Süper Yetkili (Admin)</option>
                                            <option value="Personel">Saha Personeli</option>
                                            <option value="Gözlemci">Sadece Görüntüleme</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition uppercase text-xs tracking-widest">Vazgeç</button>
                                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95 uppercase text-xs tracking-widest">Kullanıcıyı Kaydet</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}
