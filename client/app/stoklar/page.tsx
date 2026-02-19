"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ExportButton from '@/components/ExportButton';

interface Plant {
    id: string;
    name: string;
    category?: string;
    sku?: string;
    kod1?: string;
    kod2?: string;
    kod3?: string;
    kod4?: string;
    kod5?: string;
    type?: string;
    volume?: string;
    dimensions?: string;
    potType?: string; // Saksı Tipi (Yeni)
    supplierId?: string; // Tedarikçi ID (Yeni)
    unit?: string;
    image?: string;
    turkishName?: string; // Türkçe İsim (Yeni)
    currentStock?: number;
    wholesalePrice?: number;
    retailPrice?: number;
    purchasePrice?: number;
    criticalStock?: number;
    viyolCount?: number;
    cuttingCount?: number;
    createdAt: string;
}

export default function StoklarPage() {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [companies, setCompanies] = useState<any[]>([]); // For Supplier Dropdown
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newPlant, setNewPlant] = useState<Partial<Plant>>({
        name: '',
        category: '',
        sku: '',
        kod1: '',
        kod2: '',
        kod3: '',
        kod4: '',
        kod5: '',
        type: 'CUTTING',
        volume: '',
        dimensions: '',
        potType: '',
        supplierId: '',
        turkishName: '', // Türkçe İsim (Yeni)
        currentStock: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        purchasePrice: 0,
        criticalStock: 10 // Default critical stock
    });

    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201/api';

    useEffect(() => {
        fetchPlants();
        fetchCompanies();
    }, []);

    const fetchPlants = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/plants?tenantId=demo-tenant`);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Sunucu hatası');
            }
            const data = await res.json();
            setPlants(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Stoklar yüklenemedi:', err);
            setError(err.message || 'Sunucuya bağlanılamadı.');
            setPlants([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            // Tedarikçileri Satış Modülünden çekiyoruz (Müşteriler/Tedarikçiler aynı havuzda)
            const res = await fetch(`${API_URL}/sales/customers?tenantId=demo-tenant`);
            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) { }
    };


    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

    const handleEditPlant = (plant: Plant) => {
        setNewPlant({
            name: plant.name,
            category: plant.category || '',
            sku: plant.sku || '',
            kod1: plant.kod1 || '',
            kod2: plant.kod2 || '',
            kod3: plant.kod3 || '',
            kod4: plant.kod4 || '',
            kod5: plant.kod5 || '',
            type: plant.type || 'CUTTING',
            volume: plant.volume || '',
            dimensions: plant.dimensions || '',
            potType: plant.potType || '',
            supplierId: plant.supplierId ? String(plant.supplierId) : '',
            turkishName: plant.turkishName || '',
            currentStock: plant.currentStock || 0,
            wholesalePrice: plant.wholesalePrice || 0,
            retailPrice: plant.retailPrice || 0,
            purchasePrice: plant.purchasePrice || 0,
            criticalStock: plant.criticalStock || 10
        });
        setSelectedPlantId(plant.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddPlant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing
                ? `${API_URL}/plants/${selectedPlantId}?tenantId=demo-tenant`
                : `${API_URL}/plants?tenantId=demo-tenant`;

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlant),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewPlant({ name: '', category: '', sku: '', kod1: '', kod2: '', kod3: '', kod4: '', kod5: '', type: 'CUTTING', volume: '', dimensions: '', potType: '', supplierId: '', currentStock: 0, wholesalePrice: 0, retailPrice: 0, purchasePrice: 0, criticalStock: 10 });
                setIsEditing(false);
                setSelectedPlantId(null);
                fetchPlants();
            }
        } catch (err) {
            alert('Sunucuya bağlanılamadı.');
        }
    };

    const [orders, setOrders] = useState<any[]>([]); // Satınalma Geçmişi için
    const [grouping, setGrouping] = useState<'NONE' | 'CATEGORY' | 'SUPPLIER' | 'STOCK_SUPPLIER'>('NONE');

    useEffect(() => {
        fetchPlants();
        fetchCompanies();
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/purchases?tenantId=demo-tenant`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) { }
    };

    // ... (fetchPlants and fetchCompanies remain same)

    // Grouping Logic
    const getGroupedPlants = () => {
        if (grouping === 'STOCK_SUPPLIER') {
            // Special Mode: Flatten Purchase History -> (Plant + Supplier) Rows
            // We want to list: Plant Name | Supplier Name | Total Purchased Amount | Last Price
            // We iterate over ORDERS, then ITEMS.
            const stockSupplierMap = new Map<string, any>();

            orders.forEach(order => {
                if (!order.items || !Array.isArray(order.items)) return;
                const supplierName = order.supplier || 'Bilinmiyor';
                const supplierId = order.supplierId || 'unknown';
                const date = order.orderDate || order.createdAt;

                order.items.forEach((item: any) => {
                    if (!item.materialId) return;
                    const plant = plants.find(p => p.id === item.materialId);
                    if (!plant) return; // Skip if plant deleted or not found

                    const key = `${item.materialId}-${supplierId}`;

                    if (!stockSupplierMap.has(key)) {
                        stockSupplierMap.set(key, {
                            id: key, // Unique ID for table row
                            plantId: item.materialId,
                            supplierId: supplierId,
                            name: plant.name,
                            category: plant.category,
                            sku: plant.sku,
                            type: plant.type,
                            supplierName: supplierName,

                            totalPurchased: 0,
                            lastPrice: 0,
                            lastDate: date,

                            // Keep original plant data for display
                            currentStock: plant.currentStock,
                            unit: plant.unit || 'Adet',
                            image: plant.image,
                            potType: plant.potType,
                            turkishName: plant.turkishName // Türkçe İsim Mapping
                        });
                    }

                    const entry = stockSupplierMap.get(key);
                    entry.totalPurchased += (Number(item.amount) || 0);
                    // Update last price/date if this order is newer (assuming order iteration is sorted or random, let's just take latest date)
                    if (new Date(date) >= new Date(entry.lastDate)) {
                        entry.lastPrice = Number(item.unitPrice) || 0;
                        entry.lastDate = date;
                    }
                });
            });

            const sortedList = Array.from(stockSupplierMap.values()).sort((a: any, b: any) => {
                // Sort by Plant Name first
                const nameCompare = (a.name || '').localeCompare(b.name || '', 'tr');
                if (nameCompare !== 0) return nameCompare;

                // Then by Supplier Name
                return (a.supplierName || '').localeCompare(b.supplierName || '', 'tr');
            });

            // Group by Plant Name
            const groups: Record<string, any[]> = {};

            // First, flatten and sort by Supplier Name
            // Reuse sortedList as unifiedList since it is already sorted by name then supplier? 
            // Wait, previous sort was Name then Supplier.
            // New requirement: Group by Name.
            // So sortedList is already sorted by Name.
            // We can just iterate sortedList.

            sortedList.forEach((item: any) => {
                const key = item.name || 'İsimsiz';
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            });

            // No need to re-sort groups if keys are already inserted in order? 
            // Map iteration order is insertion order?
            // Safer to sort keys.

            const sortedGroups: Record<string, any[]> = {};
            Object.keys(groups).sort((a, b) => a.localeCompare(b, 'tr')).forEach(key => {
                sortedGroups[key] = groups[key];
            });

            return sortedGroups;
        }


        if (grouping === 'NONE') return { 'Tümü': plants };

        const groups: Record<string, Plant[]> = {};
        plants.forEach(plant => {
            let key = 'Diğer';
            if (grouping === 'CATEGORY') key = plant.category || 'Kategorisiz';
            else if (grouping === 'SUPPLIER') {
                const supplier = companies.find(c => c.id === plant.supplierId);
                key = supplier ? supplier.name : 'Tedarikçisiz';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(plant);
        });
        return groups;
    };

    const groupedPlants = getGroupedPlants();

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 lg:top-0 z-30 shadow-sm gap-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Stok Listesi</h1>
                        <p className="text-xs lg:text-sm text-slate-500">Tüm fidan türleri, ana ağaçlar ve grup kodları.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Grupla:</span>
                            <button onClick={() => setGrouping('NONE')} className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${grouping === 'NONE' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>YOK</button>
                            <button onClick={() => setGrouping('CATEGORY')} className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${grouping === 'CATEGORY' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>KATEGORİ</button>
                            <button onClick={() => setGrouping('SUPPLIER')} className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${grouping === 'SUPPLIER' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>TEDARİKÇİ</button>
                            <button onClick={() => setGrouping('STOCK_SUPPLIER')} className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${grouping === 'STOCK_SUPPLIER' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>STOK/CARİ</button>
                        </div>
                        <ExportButton title="Mevcut Stok Durumu" tableId="stok-table" />
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setNewPlant({ name: '', category: '', sku: '', kod1: '', kod2: '', kod3: '', kod4: '', kod5: '', type: 'CUTTING', volume: '', dimensions: '', potType: '', supplierId: '', turkishName: '', currentStock: 0, wholesalePrice: 0, retailPrice: 0, purchasePrice: 0, criticalStock: 10 });
                                setIsModalOpen(true);
                            }}
                            className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition active:scale-95"
                        >
                            + Yeni Stok Ekle
                        </button>
                    </div>
                </header>

                {/* Critical Stock Alert Banner */}
                {plants.filter(p => (p.currentStock || 0) <= (p.criticalStock || 10)).length > 0 && (
                    <div className="mx-4 lg:mx-8 mt-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl shadow-inner">⚠️</div>
                            <div>
                                <h4 className="text-sm font-black text-rose-800 uppercase tracking-wide">Kritik Stok Uyarısı</h4>
                                <p className="text-xs text-rose-600 font-medium mt-0.5">
                                    Toplam <span className="font-bold underline">{plants.filter(p => (p.currentStock || 0) <= (p.criticalStock || 10)).length} ürün</span> kritik seviyenin altında. Tedarik planlaması yapmanız önerilir.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 p-4 md:p-8 space-y-8">
                    {/* Error display omitted for brevity */}

                    {Object.entries(groupedPlants).map(([groupTitle, groupPlants]) => (
                        <div key={groupTitle} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
                            {grouping !== 'NONE' && (
                                <div className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 border-b border-emerald-700 flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">{groupTitle}</h3>
                                    <span className="text-xs font-bold text-emerald-100 bg-emerald-700/40 px-2.5 py-1 rounded-md border border-emerald-400/30">{groupPlants.length} Kayıt</span>
                                </div>
                            )}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]" id="stok-table">
                                    <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Fidan Adı & Tip</th>
                                            <th className="px-6 py-4">Kategori / SKU</th>
                                            {grouping !== 'NONE' && (
                                                <th className="px-6 py-4">Tedarikçi / Saksı</th>
                                            )}
                                            {grouping === 'STOCK_SUPPLIER' ? (
                                                <>
                                                    <th className="px-6 py-4 text-center">Toplam Alınan</th>
                                                    <th className="px-6 py-4 text-center">Son Alış Fiyatı</th>
                                                    <th className="px-6 py-4 text-center">Son Alış Tarihi</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="px-6 py-4 text-center">Mevcut Stok</th>
                                                    <th className="px-6 py-4 text-center">Birim Fiyat (Alış/Satış)</th>
                                                    <th className="px-6 py-4 text-center">Viyol / Çelik</th>
                                                </>
                                            )}
                                            <th className="px-6 py-4 text-center">Kod 1-5 (Grup)</th>
                                            <th className="px-6 py-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {groupPlants.map((plant: any) => { // Type 'any' because of mixed structure in STOCK_SUPPLIER
                                            const supplierName = grouping === 'STOCK_SUPPLIER'
                                                ? plant.supplierName
                                                : (companies.find(c => c.id === plant.supplierId)?.name || '-');

                                            // Handle different data shape for STOCK_SUPPLIER
                                            const isStockSupplierMode = grouping === 'STOCK_SUPPLIER';

                                            return (
                                                <tr key={plant.id} className="hover:bg-slate-50 transition group text-sm">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">
                                                                {plant.type === 'MOTHER_TREE' ? '🌳' : plant.type === 'PACKAGING' ? '📦' : plant.type === 'RAW_MATERIAL' ? '🧱' : '🌱'}
                                                            </span>
                                                            <div>
                                                                <p className="font-bold text-slate-700">
                                                                    {plant.name}
                                                                    {plant.turkishName && <span className="text-slate-600 font-medium ml-1 text-xs">({plant.turkishName})</span>}
                                                                </p>
                                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">
                                                                    {plant.type === 'MOTHER_TREE' ? '• ANA AĞAÇ' : plant.type === 'PACKAGING' ? '• AMBALAJ / SAKSI' : plant.type === 'RAW_MATERIAL' ? '• HAMMADDE / GÜBRE' : '• ÜRETİM MATERYALİ'}
                                                                </p>
                                                                {(plant.volume || plant.dimensions) && (
                                                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                                                        {plant.volume && `[${plant.volume}]`} {plant.dimensions && `(${plant.dimensions})`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-slate-600">{plant.category || '-'}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{plant.sku || 'SKU-YOK'}</p>
                                                    </td>
                                                    {grouping !== 'NONE' && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700 text-xs">{supplierName}</span>
                                                                {!isStockSupplierMode && (
                                                                    <span className="text-[10px] text-slate-500 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-200 text-center">
                                                                        {plant.potType || 'Saksısız'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}

                                                    {isStockSupplierMode ? (
                                                        <>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                                                    {plant.totalPurchased?.toLocaleString()} {plant.unit || 'Adet'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="font-mono font-bold text-slate-700">
                                                                    ₺{plant.lastPrice?.toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-xs text-slate-500 font-mono">
                                                                {plant.lastDate ? new Date(plant.lastDate).toLocaleDateString() : '-'}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`font-bold ${(plant.currentStock || 0) <= (plant.criticalStock || 10) ? 'text-rose-600' : 'text-slate-700'}`}>
                                                                        {plant.currentStock !== undefined ? plant.currentStock : '-'}
                                                                    </span>
                                                                    {(plant.currentStock || 0) <= (plant.criticalStock || 10) && (
                                                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-tight bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 border border-rose-100 flex items-center gap-1">
                                                                            <span>⚠️</span> Kritik ({plant.criticalStock || 10})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="font-bold text-slate-700" title="Toptan Satış Fiyatı">
                                                                        {plant.wholesalePrice ? `S: ₺${plant.wholesalePrice.toLocaleString('tr-TR')}` : '-'}
                                                                    </span>
                                                                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5" title="Alış Fiyatı (Maliyet)">
                                                                        {plant.purchasePrice ? `A: ₺${plant.purchasePrice.toLocaleString('tr-TR')}` : ''}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {plant.viyolCount ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                                                                            🧫 {plant.viyolCount} viyol
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                                                            {plant.cuttingCount?.toLocaleString()} çelik
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-300 text-xs">—</span>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}

                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-1">
                                                            {[plant.kod1, plant.kod2, plant.kod3, plant.kod4, plant.kod5].map((k: string, i: number) => (
                                                                <span key={i} title={`Kod ${i + 1}`} className={`px-2 py-1 rounded text-[9px] font-bold ${k ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                                                                    {k || '-'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {!isStockSupplierMode && (
                                                                <>
                                                                    <button
                                                                        onClick={() => alert(`Barkod Basılıyor: ${plant.sku || plant.id}`)}
                                                                        className="bg-slate-800 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all shadow-md active:scale-95"
                                                                    >
                                                                        BARKOD
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditPlant(plant)}
                                                                        className="bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all"
                                                                    >
                                                                        DÜZENLE
                                                                    </button>
                                                                </>
                                                            )}
                                                            {isStockSupplierMode && (
                                                                <span className="text-xs text-slate-400 italic">Salt Okunur</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden divide-y divide-slate-100">
                                {groupPlants.map((plant: any) => {
                                    const supplierName = grouping === 'STOCK_SUPPLIER'
                                        ? plant.supplierName
                                        : (companies.find(c => c.id === plant.supplierId)?.name || '-');
                                    const isStockSupplierMode = grouping === 'STOCK_SUPPLIER';

                                    return (
                                        <div key={plant.id} className="p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl mt-0.5">
                                                    {plant.type === 'MOTHER_TREE' ? '🌳' : plant.type === 'PACKAGING' ? '📦' : plant.type === 'RAW_MATERIAL' ? '🧱' : '🌱'}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-700 text-sm truncate">
                                                        {plant.name}
                                                        {plant.turkishName && <span className="text-slate-500 font-medium ml-1 text-xs">({plant.turkishName})</span>}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] text-emerald-600 font-black uppercase">
                                                            {plant.type === 'MOTHER_TREE' ? 'ANA AĞAÇ' : plant.type === 'PACKAGING' ? 'AMBALAJ' : plant.type === 'RAW_MATERIAL' ? 'HAMMADDE' : 'ÜRETİM'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-mono">{plant.sku || ''}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                        {isStockSupplierMode ? (
                                                            <>
                                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{plant.totalPurchased?.toLocaleString()} {plant.unit || 'Adet'}</span>
                                                                <span className="text-xs font-mono font-bold text-slate-700">₺{plant.lastPrice?.toLocaleString()}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${(plant.currentStock || 0) <= (plant.criticalStock || 10) ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
                                                                    Stok: {plant.currentStock ?? '-'}
                                                                </span>
                                                                {plant.wholesalePrice && <span className="text-[10px] text-slate-600">S:₺{plant.wholesalePrice.toLocaleString('tr-TR')}</span>}
                                                                {plant.purchasePrice && <span className="text-[10px] text-emerald-600">A:₺{plant.purchasePrice.toLocaleString('tr-TR')}</span>}
                                                            </>
                                                        )}
                                                    </div>

                                                    {grouping !== 'NONE' && (
                                                        <p className="text-[10px] text-slate-400 mt-1">Tedarikçi: {supplierName}</p>
                                                    )}

                                                    {!isStockSupplierMode && (
                                                        <div className="flex gap-2 mt-3">
                                                            <button onClick={() => alert(`Barkod Basılıyor: ${plant.sku || plant.id}`)} className="bg-slate-800 text-white px-3 py-1.5 rounded text-[10px] font-black active:scale-95">BARKOD</button>
                                                            <button onClick={() => handleEditPlant(plant)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[10px] font-black active:scale-95">DÜZENLE</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {(!Array.isArray(plants) || (plants.length === 0 && !isLoading)) && (
                        <div className="py-24 text-center space-y-4">
                            <div className="text-4xl text-slate-200">
                                {error ? '📡' : '📭'}
                            </div>
                            <p className="text-slate-400 font-medium italic">
                                {error ? 'Veriler sunucu hatası nedeniyle gösterilemiyor.' : 'Henüz stok kaydı bulunmuyor.'}
                            </p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="py-24 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 mt-4 font-bold text-[10px] uppercase tracking-widest">Veriler Yükleniyor...</p>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Stok Düzenle' : 'Yeni Stok Kaydı'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl transition">×</button>
                            </div>

                            <form onSubmit={handleAddPlant} className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fidan Adı</label>
                                    <input
                                        required
                                        type="text"
                                        value={newPlant.name}
                                        onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                        placeholder="Zeytin (Ayvalık)"
                                    />
                                    <input
                                        type="text"
                                        value={newPlant.turkishName || ''}
                                        onChange={(e) => setNewPlant({ ...newPlant, turkishName: e.target.value })}
                                        className="w-full px-4 py-2 mt-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-xs shadow-sm transition bg-slate-50"
                                        placeholder="Türkçe Karşılığı (Örn: Alev Çalısı)"
                                    />
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Kategori</label>
                                        <input
                                            type="text"
                                            value={newPlant.category}
                                            onChange={(e) => setNewPlant({ ...newPlant, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Stok Kodu (SKU)</label>
                                        <input
                                            type="text"
                                            value={newPlant.sku}
                                            onChange={(e) => setNewPlant({ ...newPlant, sku: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fidan Tipi</label>
                                    <select
                                        value={newPlant.type}
                                        onChange={(e) => setNewPlant({ ...newPlant, type: e.target.value as 'CUTTING' | 'MOTHER_TREE' | 'GRAFT' | 'PACKAGING' | 'RAW_MATERIAL' })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                    >
                                        <option value="MOTHER_TREE">🌳 Ana Ağaç (Damlama/Çelik Kaynağı)</option>
                                        <option value="CUTTING">🌱 Üretim Materyali (Dal/Fide)</option>
                                        <option value="RAW_MATERIAL">🧱 Hammadde (Toprak/Gübre/Perlit)</option>
                                        <option value="PACKAGING">📦 Ambalaj / Saksı / Kap</option>
                                        <option value="GRAFT">🌿 Aşı Materyali</option>
                                    </select>
                                </div>

                                {/* New Fields: Supplier & Pot Type */}
                                <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-600 uppercase mb-1.5 tracking-wider">Tedarikçi Firma</label>
                                        <select
                                            value={newPlant.supplierId || ''}
                                            onChange={(e) => setNewPlant({ ...newPlant, supplierId: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition bg-white"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-600 uppercase mb-1.5 tracking-wider">Saksı Tipi</label>
                                        <input
                                            type="text"
                                            value={newPlant.potType || ''}
                                            onChange={(e) => setNewPlant({ ...newPlant, potType: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition bg-white"
                                            placeholder="Örn: 14'lük, 3lt"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Mevcut Stok Miktarı</label>
                                    <input
                                        type="number"
                                        value={newPlant.currentStock}
                                        onChange={(e) => setNewPlant({ ...newPlant, currentStock: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Alış Fiyatı (Maliyet)</label>
                                        <input
                                            type="number"
                                            value={newPlant.purchasePrice}
                                            onChange={(e) => setNewPlant({ ...newPlant, purchasePrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition bg-emerald-50/20"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Toptan Fiyat (₺)</label>
                                        <input
                                            type="number"
                                            value={newPlant.wholesalePrice}
                                            onChange={(e) => setNewPlant({ ...newPlant, wholesalePrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Perakende Fiyat</label>
                                        <input
                                            type="number"
                                            value={newPlant.retailPrice}
                                            onChange={(e) => setNewPlant({ ...newPlant, retailPrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 text-sm shadow-sm transition"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-rose-500 uppercase mb-1.5 tracking-wider">Kritik Stok Seviyesi (Bildirim)</label>
                                        <input
                                            type="number"
                                            value={newPlant.criticalStock}
                                            onChange={(e) => setNewPlant({ ...newPlant, criticalStock: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-lg border border-rose-200 bg-rose-50/30 outline-none focus:border-rose-500 text-sm shadow-sm transition"
                                            placeholder="10"
                                        />
                                    </div>
                                </div>

                                {newPlant.type === 'PACKAGING' && (
                                    <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-left-2 transition-all">
                                        <div>
                                            <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1.5">Hacim / Kapasite (Litre)</label>
                                            <input
                                                type="text"
                                                value={newPlant.volume}
                                                onChange={(e) => setNewPlant({ ...newPlant, volume: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                                                placeholder="Örn: 5L, 10L"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1.5">Ölçüler (Çap x Boy)</label>
                                            <input
                                                type="text"
                                                value={newPlant.dimensions}
                                                onChange={(e) => setNewPlant({ ...newPlant, dimensions: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                                                placeholder="Örn: 20x25 cm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-2 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Grup Kodları (ERP & Raporlama)</div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i}>
                                                <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Kod {i}</label>
                                                <input
                                                    type="text"
                                                    value={(newPlant as any)[`kod${i}`]}
                                                    onChange={(e) => setNewPlant({ ...newPlant, [`kod${i}`]: e.target.value })}
                                                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs text-center focus:border-emerald-500 transition"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2 flex gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition"
                                    >
                                        Stok Kartını Kaydedin
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
