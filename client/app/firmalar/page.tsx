"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function FirmalarPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCompany, setNewCompany] = useState({
        name: '',
        taxNumber: '',
        address: '',
        city: 'Yalova',
        country: 'Türkiye',
        contactPerson: '',
        email: '',
        phone: ''
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await fetch(`${API_URL}/tenants`);
            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editMode ? `${API_URL}/tenants/${editingId}` : `${API_URL}/tenants`;
            const method = editMode ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompany),
            });

            if (res.ok) {
                closeModal();
                fetchCompanies();
            }
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch(`${API_URL}/tenants/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCompanies();
        } catch (err) {
            alert('Silme işlemi başarısız.');
        }
    };

    const openEditModal = (company: any) => {
        setNewCompany({
            name: company.name || '',
            taxNumber: company.taxNumber || '',
            address: company.address || '',
            city: company.city || 'Yalova',
            country: company.country || 'Türkiye',
            contactPerson: company.contactPerson || '',
            email: company.email || '',
            phone: company.phone || ''
        });
        setEditingId(company.id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditMode(false);
        setEditingId(null);
        setNewCompany({ name: '', taxNumber: '', address: '', city: 'Yalova', country: 'Türkiye', contactPerson: '', email: '', phone: '' });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 z-30 gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Firma Yönetimi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Müşteri ve tedarikçi profillerini yönetin.</p>
                    </div>
                    <button
                        onClick={() => { closeModal(); setIsModalOpen(true); }}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition active:scale-95"
                    >
                        + Yeni Firma Kaydı
                    </button>
                </header>

                <div className="flex-1 p-4 md:p-8">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Firma Ünvanı / VKN</th>
                                    <th className="px-6 py-4">İlgili Kişi</th>
                                    <th className="px-6 py-4">Konum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {Array.isArray(companies) && companies.map((company: any) => (
                                    <tr key={company.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700">{company.name}</p>
                                            <p className="text-[10px] text-slate-400">VKN: {company.taxNumber || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <p className="font-semibold">{company.contactPerson || '-'}</p>
                                            <p className="text-xs text-slate-400">{company.email || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {company.city || '-'} / {company.country || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(company)}
                                                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                                                >
                                                    DÜZENLE
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company.id)}
                                                    className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-rose-100 transition"
                                                >
                                                    SİL
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!Array.isArray(companies) || companies.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-slate-400 italic font-medium">
                                            {!Array.isArray(companies) ? 'Veri alınamadı, sunucu kontrol ediliyor...' : 'Kayıtlı firma bulunamadı.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">
                                {editMode ? 'Firma Bilgilerini Düzenle' : 'Yeni Firma Kaydı'}
                            </h3>
                            <form onSubmit={handleAddCompany} className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Firma Ticari Ünvanı</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                        placeholder="Örn: Fidanx Tarım Ltd. Şti."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">VKN / Vergi No</label>
                                    <input
                                        type="text"
                                        value={newCompany.taxNumber}
                                        onChange={(e) => setNewCompany({ ...newCompany, taxNumber: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">İlgili Kişi</label>
                                    <input
                                        type="text"
                                        value={newCompany.contactPerson}
                                        onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Açık Adres</label>
                                    <textarea
                                        rows={2}
                                        value={newCompany.address}
                                        onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">E-Posta</label>
                                        <input
                                            type="email"
                                            value={newCompany.email}
                                            onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Telefon</label>
                                        <input
                                            type="tel"
                                            value={newCompany.phone}
                                            onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 flex gap-4 mt-6">
                                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition">İptal</button>
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition active:scale-95">
                                        {editMode ? 'Değişiklikleri Kaydet' : 'Firmayı Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
