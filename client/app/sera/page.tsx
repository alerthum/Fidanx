"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SeraPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Form State
    const [formData, setFormData] = useState({
        id: null as string | null,
        date: new Date().toISOString().split('T')[0],
        seraIci: { sabah: '', ogle: '', aksam: '' },
        seraDisi: { sabah: '', ogle: '', aksam: '' },
        mazot: '',
        note: ''
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/production/temperature-logs?tenantId=demo-tenant`);
            if (res.ok) {
                const data = await res.json();
                // Sort by date desc
                setLogs(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (log?: any) => {
        if (log) {
            setFormData({
                id: log.id,
                date: new Date(log.date).toISOString().split('T')[0],
                seraIci: {
                    sabah: log.seraIci?.sabah ?? '',
                    ogle: log.seraIci?.ogle ?? '',
                    aksam: log.seraIci?.aksam ?? ''
                },
                seraDisi: {
                    sabah: log.seraDisi?.sabah ?? '',
                    ogle: log.seraDisi?.ogle ?? '',
                    aksam: log.seraDisi?.aksam ?? ''
                },
                mazot: log.mazot ?? '',
                note: log.note || log.notes || ''
            });
        } else {
            setFormData({
                id: null,
                date: new Date().toISOString().split('T')[0],
                seraIci: { sabah: '', ogle: '', aksam: '' },
                seraDisi: { sabah: '', ogle: '', aksam: '' },
                mazot: '',
                note: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const payload = {
            date: formData.date,
            seraIci: {
                sabah: formData.seraIci.sabah ? parseFloat(formData.seraIci.sabah) : null,
                ogle: formData.seraIci.ogle ? parseFloat(formData.seraIci.ogle) : null,
                aksam: formData.seraIci.aksam ? parseFloat(formData.seraIci.aksam) : null,
            },
            seraDisi: {
                sabah: formData.seraDisi.sabah ? parseFloat(formData.seraDisi.sabah) : null,
                ogle: formData.seraDisi.ogle ? parseFloat(formData.seraDisi.ogle) : null,
                aksam: formData.seraDisi.aksam ? parseFloat(formData.seraDisi.aksam) : null,
            },
            mazot: formData.mazot ? parseFloat(formData.mazot) : null,
            note: formData.note
        };

        // If all sub-fields are null, set parent to null to keep db clean(er)
        if (!payload.seraIci.sabah && !payload.seraIci.ogle && !payload.seraIci.aksam) (payload as any).seraIci = null;
        if (!payload.seraDisi.sabah && !payload.seraDisi.ogle && !payload.seraDisi.aksam) (payload as any).seraDisi = null;

        try {
            if (formData.id) {
                // Update (Not implemented in backend controller yet explicitly, but POST usually handles create. 
                // Wait, TemperatureService.create is implemented. Update logic might be missing or we use create to add new log.
                // Actually, usually we might want to Delete then Create or Update.
                // Let's check backend... Controller only has findAll and create. 
                // I will use DELETE then CREATE for "Update" simulation or just CREATE new one if backend assumes append-only.
                // However, for best UX, I'll add a DELETE endpoint logic if needed, but for now I'll just create new entries.
                // Wait, I saw TemperatureService has remove.
                await fetch(`${API_URL}/production/temperature-logs/${formData.id}?tenantId=demo-tenant`, { method: 'DELETE' });
            }

            const res = await fetch(`${API_URL}/production/temperature-logs?tenantId=demo-tenant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchLogs();
            } else {
                alert('Kaydetme başarısız.');
            }
        } catch (err) {
            console.error(err);
            alert('Hata oluştu.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${API_URL}/production/temperature-logs/${id}?tenantId=demo-tenant`, { method: 'DELETE' });
            fetchLogs();
        } catch (err) {
            alert('Silme hatası.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 p-4 lg:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Sera & İklim Takibi</h1>
                        <p className="text-slate-500">Sıcaklık ölçümleri ve yakıt tüketim kayıtları.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition"
                    >
                        + Yeni Kayıt Ekle
                    </button>
                </div>

                {/* Data Grid */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4 text-center bg-orange-50/50 text-orange-800 border-l border-orange-100">Sera 1 (İç) <br /><span className="text-[9px] opacity-70">Sabah / Öğle / Akşam</span></th>
                                    <th className="px-6 py-4 text-center bg-blue-50/50 text-blue-800 border-l border-blue-100">Açık Alan (Dış) <br /><span className="text-[9px] opacity-70">Sabah / Öğle / Akşam</span></th>
                                    <th className="px-6 py-4 text-center border-l border-slate-100">Mazot (Lt)</th>
                                    <th className="px-6 py-4">Not</th>
                                    <th className="px-6 py-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                            {new Date(log.date).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 text-center border-l border-slate-100">
                                            <div className="flex justify-center gap-2 font-mono text-xs">
                                                <span className="text-slate-400" title="Sabah">{log.seraIci?.sabah ?? '-'}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-orange-600 font-bold" title="Öğle">{log.seraIci?.ogle ?? '-'}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-slate-500" title="Akşam">{log.seraIci?.aksam ?? '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-l border-slate-100">
                                            <div className="flex justify-center gap-2 font-mono text-xs">
                                                <span className="text-slate-400" title="Sabah">{log.seraDisi?.sabah ?? '-'}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-blue-600 font-bold" title="Öğle">{log.seraDisi?.ogle ?? '-'}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-slate-500" title="Akşam">{log.seraDisi?.aksam ?? '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-l border-slate-100 font-bold text-slate-700">
                                            {log.mazot ? `${log.mazot} Lt` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[150px]">
                                            {log.note || log.notes || ''}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenModal(log)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold mr-3">Düzenle</button>
                                            <button onClick={() => handleDelete(log.id)} className="text-rose-400 hover:text-rose-600 text-xs font-bold">Sil</button>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && !loading && (
                                    <tr><td colSpan={6} className="text-center py-12 text-slate-400 italic">Kayıt bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h3 className="text-xl font-bold mb-6 text-slate-800">
                                {formData.id ? 'Kaydı Güncelle' : 'Yeni Ölçüm / Sarfiyat Ekle'}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Tarih</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Sera İçi */}
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <h4 className="text-sm font-bold text-orange-800 mb-4 flex items-center gap-2">
                                            🌡️ Sera 1 (İç) Sıcaklık (°C)
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-orange-400">Sabah</label>
                                                <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-orange-200 text-center font-bold text-slate-700" placeholder="-"
                                                    value={formData.seraIci.sabah} onChange={e => setFormData({ ...formData, seraIci: { ...formData.seraIci, sabah: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-orange-400">Öğle</label>
                                                <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-orange-200 text-center font-bold text-slate-700" placeholder="-"
                                                    value={formData.seraIci.ogle} onChange={e => setFormData({ ...formData, seraIci: { ...formData.seraIci, ogle: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-orange-400">Akşam</label>
                                                <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-orange-200 text-center font-bold text-slate-700" placeholder="-"
                                                    value={formData.seraIci.aksam} onChange={e => setFormData({ ...formData, seraIci: { ...formData.seraIci, aksam: e.target.value } })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sera Dışı */}
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                                            ☁️ Açık Alan (Dış) Sıcaklık (°C)
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-blue-400">Sabah</label>
                                                <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-blue-200 text-center font-bold text-slate-700" placeholder="-"
                                                    value={formData.seraDisi.sabah} onChange={e => setFormData({ ...formData, seraDisi: { ...formData.seraDisi, sabah: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-blue-400">Öğle</label>
                                                <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-blue-200 text-center font-bold text-slate-700" placeholder="-"
                                                    value={formData.seraDisi.ogle} onChange={e => setFormData({ ...formData, seraDisi: { ...formData.seraDisi, ogle: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-blue-400">Akşam</label>
                                                <input type="number" step="0.1" className="w-full p-2 rounded-lg border border-blue-200 text-center font-bold text-slate-700" placeholder="-"
                                                    value={formData.seraDisi.aksam} onChange={e => setFormData({ ...formData, seraDisi: { ...formData.seraDisi, aksam: e.target.value } })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">⛽ Mazot Tüketimi (Litre)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700"
                                        placeholder="0.0"
                                        value={formData.mazot}
                                        onChange={e => setFormData({ ...formData, mazot: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Not / Açıklama</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 min-h-[80px]"
                                        placeholder="Varsa notlarınız..."
                                        value={formData.note}
                                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">İptal</button>
                                    <button onClick={handleSubmit} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Kaydet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
