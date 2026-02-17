import { Controller, Delete, Query, Post } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('seed')
export class SeedController {
    constructor(private firebase: FirebaseService) { }

    @Post()
    async seed(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);

        // Tenant dökümanı yoksa oluştur
        const tenantDoc = await tenantRef.get();
        if (!tenantDoc.exists) {
            await tenantRef.set({
                name: 'FidanX İşletmesi',
                settings: {
                    categories: ['Süs Bitkisi', 'Meyve Fidanı', 'Ağaç', 'Çalı'],
                    productionStages: ['VİYOL', 'KÜÇÜK_SAKSI', 'BÜYÜK_SAKSI', 'SATIŞA_HAZIR'],
                    locations: ['Sera A', 'Sera B', 'Açık Alan 1', 'Açık Alan 2', 'Depo'],
                },
                createdAt: new Date(),
            });
        }

        // Önce temizlik
        await this.clear(tenantId);

        const plantsRef = tenantRef.collection('plants');
        const prodRef = tenantRef.collection('production');
        const recipeRef = tenantRef.collection('recipes');
        const custRef = tenantRef.collection('customers');
        const purchaseRef = tenantRef.collection('purchases');
        const expRef = tenantRef.collection('expenses');
        const activityRef = tenantRef.collection('activity_logs');
        const tempRef = tenantRef.collection('temperature_logs');
        const fertRef = tenantRef.collection('fertilizer_logs');

        // ═══════════════════════════════════════════════════════════════
        //  1. BİTKİ / STOK KARTLARI (plants) — elimizdeki bitkiler.docx
        // ═══════════════════════════════════════════════════════════════
        const plantData = [
            { name: 'Leylandi', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 2200, wholesalePrice: 104.5, retailPrice: 225, viyolCount: 643, cuttingCount: 45010 },
            { name: 'Leylandi - büyük', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 1000, wholesalePrice: 104.5, retailPrice: 250 },
            { name: 'Alev çalısı', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 300, wholesalePrice: 83.5, retailPrice: 150, viyolCount: 44, cuttingCount: 3080 },
            { name: 'Bodur alev çalısı', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 270, wholesalePrice: 125, retailPrice: 250 },
            { name: 'Gold taflan', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 80, retailPrice: 150, viyolCount: 11, cuttingCount: 770 },
            { name: 'Bravo taflan', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 175, retailPrice: 300, viyolCount: 10, cuttingCount: 700 },
            { name: 'Alacalı taflan', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 8, wholesalePrice: 0, retailPrice: 150, viyolCount: 8, cuttingCount: 560 },
            { name: 'Taflan', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 25, retailPrice: 60 },
            { name: 'Limona çamı', category: 'Ağaç', type: 'CUTTING', currentStock: 100, wholesalePrice: 104.5, retailPrice: 200 },
            { name: 'Licudum - büyük', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 210, wholesalePrice: 104.5, retailPrice: 200 },
            { name: 'Licudum - küçük', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 33.5, retailPrice: 75 },
            { name: 'Licudum - orta boy', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 200, wholesalePrice: 104.5, retailPrice: 175 },
            { name: 'Kartopu', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 21, retailPrice: 50 },
            { name: 'Lükstrüm', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 300, wholesalePrice: 20.83, retailPrice: 50 },
            { name: 'Yeşil iğde', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 20, wholesalePrice: 400, retailPrice: 700 },
            { name: 'Alacalı iğde', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 20, wholesalePrice: 425, retailPrice: 750 },
            { name: 'Nandina jeika', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 30, wholesalePrice: 175, retailPrice: 350, volume: '5 lt' },
            { name: 'Bodur nandina', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 220, wholesalePrice: 350, retailPrice: 600, volume: '10 lt' },
            { name: 'Nandina domestica', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 225, wholesalePrice: 90, retailPrice: 200 },
            { name: 'Nandina domestica fire power', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 150, retailPrice: 300 },
            { name: 'Nandina gulfstream', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 250, retailPrice: 475 },
            { name: 'Arap yasemini', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 30, wholesalePrice: 160, retailPrice: 300, volume: '5 lt', viyolCount: 8, cuttingCount: 560 },
            { name: 'Altuni mazı', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 20, wholesalePrice: 500, retailPrice: 900 },
            { name: 'Loropetalum black pearl', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 30, wholesalePrice: 600, retailPrice: 1200 },
            { name: 'Lorapetalum', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 7, wholesalePrice: 750, retailPrice: 1500, volume: '20 lt' },
            { name: 'Ligustrum texanum', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 350, retailPrice: 600 },
            { name: 'Elaeagnus ebbingei', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 300, retailPrice: 550 },
            { name: 'Euonymus japonica bravo', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 10, wholesalePrice: 300, retailPrice: 550 },
            { name: 'Juniperus x media pfitzeriana aurea', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 300, retailPrice: 550 },
            { name: 'Juniperus horizontalis blue chip', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 300, retailPrice: 550 },
            { name: 'Juniperus horizontalis prince of wales', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 300, retailPrice: 550 },
            { name: 'Liquidambar styraciflua', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 3500, retailPrice: 6000 },
            { name: 'Albizia julibrissin', category: 'Ağaç', type: 'CUTTING', currentStock: 4, wholesalePrice: 3000, retailPrice: 5000 },
            { name: 'Acer negundo', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 3500, retailPrice: 6000 },
            { name: 'Acer saccharinum', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 3500, retailPrice: 6000 },
            { name: 'Platanus occidentalis', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 3000, retailPrice: 5000 },
            { name: 'Ulmus glabra pendula', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 6000, retailPrice: 10000 },
            { name: 'Morus platanifolia', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 3000, retailPrice: 5000 },
            { name: 'Photinia fraseri red robin', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 50, wholesalePrice: 100, retailPrice: 200 },
            { name: 'İlex aquifolium argentea marginata', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 100, wholesalePrice: 150, retailPrice: 300 },
            { name: 'Lagerstroemia indica', category: 'Ağaç', type: 'CUTTING', currentStock: 2, wholesalePrice: 3500, retailPrice: 6000 },
            { name: 'Texanum', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 10, wholesalePrice: 1000, retailPrice: 1800, viyolCount: 37, cuttingCount: 2590 },
            { name: 'Kalem servi', category: 'Ağaç', type: 'CUTTING', currentStock: 10, wholesalePrice: 3750, retailPrice: 6000 },
            { name: 'Kara yemiş', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 7, wholesalePrice: 250, retailPrice: 500 },
            { name: 'Defne', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 10, wholesalePrice: 1250, retailPrice: 2000 },
            { name: 'Himalaya', category: 'Ağaç', type: 'CUTTING', currentStock: 10, wholesalePrice: 2000, retailPrice: 3500 },
            { name: 'Fırça çalı', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 2, wholesalePrice: 1000, retailPrice: 1800 },
            { name: 'Tinus kartopu', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 20, wholesalePrice: 750, retailPrice: 1300 },
            { name: 'Licudum kartopu', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 10, wholesalePrice: 1250, retailPrice: 2000 },
            { name: 'Kırmızı yapraklı akçaağaç', category: 'Ağaç', type: 'CUTTING', currentStock: 20, wholesalePrice: 2000, retailPrice: 3500 },
            { name: 'Akuba', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 20, wholesalePrice: 175, retailPrice: 350 },
            { name: 'Mavi arizona servisi', category: 'Ağaç', type: 'CUTTING', currentStock: 150, wholesalePrice: 400, retailPrice: 700 },
            { name: 'Limoni servi', category: 'Ağaç', type: 'CUTTING', currentStock: 16, wholesalePrice: 0, retailPrice: 0, viyolCount: 16, cuttingCount: 1120 },
            { name: 'Mavi halı ardıç', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 6, wholesalePrice: 0, retailPrice: 0, viyolCount: 6, cuttingCount: 420 },
            { name: 'Altuni pekin ardıç', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 8, wholesalePrice: 0, retailPrice: 0, viyolCount: 8, cuttingCount: 560 },
            { name: 'Galler prensi yatay ardıç', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 10, wholesalePrice: 0, retailPrice: 0, viyolCount: 10, cuttingCount: 700 },
            { name: 'Yerli kartopu', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 8, wholesalePrice: 0, retailPrice: 0, viyolCount: 8, cuttingCount: 560 },
            { name: 'Kaymak ağacı', category: 'Ağaç', type: 'CUTTING', currentStock: 1, wholesalePrice: 0, retailPrice: 0, viyolCount: 1, cuttingCount: 70 },
            { name: 'Zeytin', category: 'Meyve Fidanı', type: 'CUTTING', currentStock: 4, wholesalePrice: 0, retailPrice: 0, viyolCount: 4, cuttingCount: 245 },
            { name: 'Red robin', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 40, wholesalePrice: 0, retailPrice: 0, viyolCount: 40, cuttingCount: 2800 },
            { name: 'Alacalı süs iğde', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 36, wholesalePrice: 0, retailPrice: 0, viyolCount: 36, cuttingCount: 2520 },
            { name: 'Yeşil süs iğde', category: 'Süs Bitkisi', type: 'CUTTING', currentStock: 12, wholesalePrice: 0, retailPrice: 0, viyolCount: 12, cuttingCount: 840 },
        ];

        const plantIds: Record<string, string> = {};
        for (const p of plantData) {
            const ref = await plantsRef.add({ ...p, createdAt: new Date() });
            plantIds[p.name] = ref.id;
        }

        // ═══════════════════════════════════════════════════════════════
        //  2. TEDARİKÇİ / FİRMA BİLGİLERİ (customers) — elimizdeki bitkiler.docx
        // ═══════════════════════════════════════════════════════════════
        const suppliers = [
            { name: 'Ödemiş Ceza İnfaz Kurumu', type: 'SUPPLIER', phone: '', address: 'Ödemiş, İzmir', region: 'Ege', note: 'Kamu kurumu tedarikçi' },
            { name: 'Adnan Aktaş', type: 'SUPPLIER', phone: '', address: '', region: 'Ege', note: 'Süs bitkisi tedarikçisi' },
            { name: 'Hilmi Durutaş', type: 'SUPPLIER', phone: '', address: '', region: 'Ege', note: 'Ağaç ve süs bitkisi tedarikçisi' },
            { name: 'Sever Fidancılık', type: 'SUPPLIER', phone: '', address: '', region: '', note: 'Bodur alev çalısı tedarikçisi' },
            { name: 'Nazmi Yiğenli', type: 'SUPPLIER', phone: '', address: '', region: '', note: 'Çeşitli süs bitkileri tedarikçisi' },
            { name: 'Parlar Fidan', type: 'SUPPLIER', phone: '', address: '', region: '', note: 'Çeşitli fidan tedarikçisi' },
        ];

        const supplierIds: Record<string, string> = {};
        for (const s of suppliers) {
            const ref = await custRef.add({ ...s, createdAt: new Date() });
            supplierIds[s.name] = ref.id;
        }

        // ═══════════════════════════════════════════════════════════════
        //  3. SATINALMA KAYITLARI (purchases)
        // ═══════════════════════════════════════════════════════════════
        const purchaseGroups = [
            {
                supplier: 'Ödemiş Ceza İnfaz Kurumu', date: '2025-10-16',
                items: [
                    { name: 'Alev çalısı', amount: 300, unitPrice: 83.5 },
                    { name: 'Gold taflan', amount: 388, unitPrice: 29.5 },
                    { name: 'Bravo taflan', amount: 412, unitPrice: 29.5 },
                    { name: 'Limona çamı', amount: 100, unitPrice: 104.5 },
                    { name: 'Licudum - büyük', amount: 100, unitPrice: 104.5 },
                    { name: 'Kartopu', amount: 100, unitPrice: 21 },
                    { name: 'Lükstrüm', amount: 300, unitPrice: 20.83 },
                    { name: 'Licudum - küçük', amount: 100, unitPrice: 33.5 },
                    { name: 'Taflan', amount: 100, unitPrice: 25 },
                    { name: 'Leylandi', amount: 1200, unitPrice: 104.5 },
                ]
            },
            {
                supplier: 'Ödemiş Ceza İnfaz Kurumu', date: '2025-10-24',
                items: [
                    { name: 'Leylandi - büyük', amount: 1000, unitPrice: 104.5 },
                    { name: 'Licudum - orta boy', amount: 200, unitPrice: 104.5 },
                    { name: 'Licudum - büyük', amount: 110, unitPrice: 125 },
                ]
            },
            {
                supplier: 'Adnan Aktaş', date: '2025-11-06',
                items: [
                    { name: 'Yeşil iğde', amount: 20, unitPrice: 400 },
                    { name: 'Alacalı iğde', amount: 20, unitPrice: 425 },
                    { name: 'Bodur alev çalısı', amount: 50, unitPrice: 130 },
                    { name: 'Bodur alev çalısı', amount: 20, unitPrice: 350 },
                    { name: 'Nandina jeika', amount: 30, unitPrice: 175 },
                    { name: 'Bodur nandina', amount: 20, unitPrice: 350 },
                    { name: 'Arap yasemini', amount: 30, unitPrice: 160 },
                    { name: 'Altuni mazı', amount: 20, unitPrice: 500 },
                    { name: 'Alev çalısı', amount: 20, unitPrice: 250 },
                    { name: 'Alev çalısı', amount: 20, unitPrice: 150 },
                    { name: 'Lorapetalum', amount: 7, unitPrice: 750 },
                    { name: 'Nandina domestica', amount: 50, unitPrice: 100 },
                    { name: 'Nandina domestica', amount: 25, unitPrice: 200 },
                ]
            },
            {
                supplier: 'Hilmi Durutaş', date: '2025-11-06',
                items: [
                    { name: 'Nandina domestica', amount: 100, unitPrice: 90 },
                    { name: 'Loropetalum black pearl', amount: 10, unitPrice: 1000 },
                    { name: 'Ligustrum texanum', amount: 50, unitPrice: 350 },
                    { name: 'Elaeagnus ebbingei', amount: 50, unitPrice: 300 },
                    { name: 'Euonymus japonica bravo', amount: 10, unitPrice: 300 },
                    { name: 'Nandina domestica fire power', amount: 50, unitPrice: 150 },
                    { name: 'Juniperus x media pfitzeriana aurea', amount: 50, unitPrice: 300 },
                    { name: 'Juniperus horizontalis blue chip', amount: 50, unitPrice: 300 },
                    { name: 'Juniperus horizontalis prince of wales', amount: 50, unitPrice: 300 },
                    { name: 'Liquidambar styraciflua', amount: 2, unitPrice: 3500 },
                    { name: 'Albizia julibrissin', amount: 4, unitPrice: 3000 },
                    { name: 'Acer negundo', amount: 2, unitPrice: 3500 },
                    { name: 'Acer saccharinum', amount: 2, unitPrice: 3500 },
                    { name: 'Platanus occidentalis', amount: 2, unitPrice: 3000 },
                    { name: 'Ulmus glabra pendula', amount: 2, unitPrice: 6000 },
                    { name: 'Morus platanifolia', amount: 2, unitPrice: 3000 },
                    { name: 'Photinia fraseri red robin', amount: 50, unitPrice: 100 },
                    { name: 'İlex aquifolium argentea marginata', amount: 100, unitPrice: 150 },
                    { name: 'Lagerstroemia indica', amount: 2, unitPrice: 3500 },
                    { name: 'Loropetalum black pearl', amount: 20, unitPrice: 600 },
                ]
            },
            {
                supplier: 'Sever Fidancılık', date: '2025-11-11',
                items: [
                    { name: 'Bodur alev çalısı', amount: 200, unitPrice: 125 },
                ]
            },
            {
                supplier: 'Nazmi Yiğenli', date: '2025-11-11',
                items: [
                    { name: 'Texanum', amount: 10, unitPrice: 1000 },
                    { name: 'Kalem servi', amount: 10, unitPrice: 3750 },
                    { name: 'Kara yemiş', amount: 7, unitPrice: 250 },
                    { name: 'Defne', amount: 10, unitPrice: 1250 },
                    { name: 'Alev çalısı', amount: 10, unitPrice: 1500 },
                    { name: 'Leylandi', amount: 1000, unitPrice: 225 },
                    { name: 'Himalaya', amount: 10, unitPrice: 2000 },
                    { name: 'Fırça çalı', amount: 2, unitPrice: 1000 },
                    { name: 'Tinus kartopu', amount: 20, unitPrice: 750 },
                    { name: 'Leylandi - büyük', amount: 10, unitPrice: 2000 },
                    { name: 'Licudum kartopu', amount: 10, unitPrice: 1250 },
                ]
            },
            {
                supplier: 'Parlar Fidan', date: '2025-11-13',
                items: [
                    { name: 'Bravo taflan', amount: 100, unitPrice: 175 },
                    { name: 'Kırmızı yapraklı akçaağaç', amount: 20, unitPrice: 2000 },
                    { name: 'Akuba', amount: 20, unitPrice: 175 },
                    { name: 'Nandina gulfstream', amount: 100, unitPrice: 250 },
                    { name: 'Gold taflan', amount: 100, unitPrice: 80 },
                    { name: 'Mavi arizona servisi', amount: 150, unitPrice: 400 },
                    { name: 'Bodur nandina', amount: 200, unitPrice: 475 },
                ]
            },
        ];

        for (const group of purchaseGroups) {
            const supplierId = supplierIds[group.supplier] || '';
            const items = group.items.map(item => ({
                name: item.name,
                materialId: plantIds[item.name] || '',
                amount: item.amount,
                unitPrice: item.unitPrice,
                totalPrice: item.amount * item.unitPrice,
            }));
            const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);

            await purchaseRef.add({
                supplier: group.supplier,
                supplierId,
                items,
                totalAmount,
                status: 'Tamamlandı',
                orderDate: new Date(group.date),
                receivedDate: new Date(group.date),
                createdAt: new Date(),
            });
        }

        // ═══════════════════════════════════════════════════════════════
        //  4. ÜRETİM PARTİLERİ (production) — viyol no.docx
        // ═══════════════════════════════════════════════════════════════
        const productionBatches = [
            { lotId: 'LOT-2025-LEYLANDI-001', name: 'Leylandi Çelik', plantName: 'Leylandi', quantity: 45010, viyolCount: 643, startDate: '2025-11-24', endDate: '2025-12-13', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-ZEYTIN-002', name: 'Zeytin Çelik', plantName: 'Zeytin', quantity: 245, viyolCount: 4, startDate: '2025-12-15', endDate: '2025-12-15', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-TEXANUM-003', name: 'Texanum Çelik', plantName: 'Texanum', quantity: 2590, viyolCount: 37, startDate: '2025-12-15', endDate: '2025-12-17', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-ALEVCALISI-004', name: 'Alev Çalısı Çelik', plantName: 'Alev çalısı', quantity: 3080, viyolCount: 44, startDate: '2025-12-17', endDate: '2025-12-18', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-ARAPSM-005', name: 'Arap Yasemini Çelik', plantName: 'Arap yasemini', quantity: 560, viyolCount: 8, startDate: '2025-12-18', endDate: '2025-12-18', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-ALIGDE-006', name: 'Alacalı Süs İğde Çelik', plantName: 'Alacalı süs iğde', quantity: 2520, viyolCount: 36, startDate: '2025-12-18', endDate: '2025-12-19', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-YIGDE-007', name: 'Yeşil Süs İğde Çelik', plantName: 'Yeşil süs iğde', quantity: 840, viyolCount: 12, startDate: '2025-12-19', endDate: '2025-12-19', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-GOLDTF-008', name: 'Gold Taflan Çelik', plantName: 'Gold taflan', quantity: 770, viyolCount: 11, startDate: '2025-12-20', endDate: '2025-12-20', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-REDRBN-009', name: 'Red Robin Çelik', plantName: 'Red robin', quantity: 2800, viyolCount: 40, startDate: '2025-12-20', endDate: '2025-12-22', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-BRAVOTF-010', name: 'Bravo Taflan Çelik', plantName: 'Bravo taflan', quantity: 700, viyolCount: 10, startDate: '2025-12-22', endDate: '2025-12-22', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-LIMSERV-011', name: 'Limoni Servi Çelik', plantName: 'Limoni servi', quantity: 1120, viyolCount: 16, startDate: '2025-12-24', endDate: '2025-12-24', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-MAVIARD-012', name: 'Mavi Halı Ardıç Çelik', plantName: 'Mavi halı ardıç', quantity: 420, viyolCount: 6, startDate: '2025-12-25', endDate: '2025-12-25', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-ALTARD-013', name: 'Altuni Pekin Ardıç Çelik', plantName: 'Altuni pekin ardıç', quantity: 560, viyolCount: 8, startDate: '2025-12-25', endDate: '2025-12-25', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-GALARD-014', name: 'Galler Prensi Yatay Ardıç Çelik', plantName: 'Galler prensi yatay ardıç', quantity: 700, viyolCount: 10, startDate: '2025-12-25', endDate: '2025-12-26', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-ALTAFLAN-015', name: 'Alacalı Taflan Çelik', plantName: 'Alacalı taflan', quantity: 560, viyolCount: 8, startDate: '2025-12-26', endDate: '2025-12-26', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-YERLIKRT-016', name: 'Yerli Kartopu Çelik', plantName: 'Yerli kartopu', quantity: 560, viyolCount: 8, startDate: '2025-12-26', endDate: '2025-12-26', stage: 'VİYOL', location: 'Sera A' },
            { lotId: 'LOT-2025-KAYMAK-017', name: 'Kaymak Ağacı Çelik', plantName: 'Kaymak ağacı', quantity: 70, viyolCount: 1, startDate: '2025-12-27', endDate: '2025-12-27', stage: 'VİYOL', location: 'Sera A' },
        ];

        for (const batch of productionBatches) {
            await prodRef.add({
                ...batch,
                startDate: new Date(batch.startDate),
                history: [
                    { date: new Date(batch.startDate), action: 'Çelik Dikildi', note: `${batch.viyolCount} viyol, ${batch.quantity} adet çelik` }
                ],
                createdAt: new Date(),
            });
        }

        // ═══════════════════════════════════════════════════════════════
        //  5. GÜBRE UYGULAMA KAYITLARI (fertilizer_logs)
        // ═══════════════════════════════════════════════════════════════
        const fertilizerData = [
            { date: '2025-12-02', aminoAsit: true },
            { date: '2025-12-03', fungusit: true },
            { date: '2025-12-11', fungusit: true },
            { date: '2025-12-12', aminoAsit: true },
            { date: '2025-12-16', start: true },
            { date: '2025-12-17', fungusit: true },
            { date: '2025-12-18', fungusit: true },
            { date: '2025-12-19', fungusit: true },
            { date: '2025-12-22', start: true },
            { date: '2025-12-23', fungusit: true, note: 'NPK' },
            { date: '2025-12-29', aminoAsit: true, start: true },
            { date: '2025-12-31', start: true },
            { date: '2026-01-02', aminoAsit: true },
            { date: '2026-01-03', start: true },
            { date: '2026-01-05', aminoAsit: true },
            { date: '2026-01-06', start: true },
            { date: '2026-01-07', aminoAsit: true },
            { date: '2026-01-08', start: true },
            { date: '2026-01-09', aminoAsit: true },
            { date: '2026-01-10', start: true },
            { date: '2026-01-12', start: true },
            { date: '2026-01-13', aminoAsit: true },
            { date: '2026-01-14', start: true },
            { date: '2026-01-15', aminoAsit: true },
            { date: '2026-01-16', start: true },
            { date: '2026-01-17', aminoAsit: true },
            { date: '2026-01-19', start: true },
            { date: '2026-01-20', aminoAsit: true },
            { date: '2026-01-21', start: true },
            { date: '2026-01-22', aminoAsit: true },
            { date: '2026-01-23', start: true },
            { date: '2026-01-24', aminoAsit: true },
        ];

        for (const f of fertilizerData) {
            await fertRef.add({
                date: new Date(f.date),
                fungusit: f.fungusit || false,
                aminoAsit: f.aminoAsit || false,
                start: f.start || false,
                note: f.note || '',
                createdAt: new Date(),
            });
        }

        // ═══════════════════════════════════════════════════════════════
        //  6. SERA SICAKLIK ÖLÇÜMLERİ (temperature_logs)
        // ═══════════════════════════════════════════════════════════════
        const temperatureData = [
            { date: '2025-11-26', seraIci: { sabah: 0.5, ogle: 19.4, aksam: 23.2 }, seraDisi: { sabah: 1.7, ogle: 25.0, aksam: 22.0 } },
            { date: '2025-11-28', seraIci: { sabah: 1.5, ogle: 24.5, aksam: 23.1 }, seraDisi: { sabah: 0.0, ogle: 23.1, aksam: 12.3 } },
            { date: '2025-11-29', seraIci: { sabah: 8.5, ogle: 9.3, aksam: null }, seraDisi: { sabah: 9.5, ogle: 8.8, aksam: null } },
            { date: '2025-12-01', seraIci: { sabah: 4.4, ogle: 18.6, aksam: 17.7 }, seraDisi: { sabah: 1.3, ogle: 16.0, aksam: 15.9 } },
            { date: '2025-12-02', seraIci: { sabah: 0.6, ogle: 28.2, aksam: 20.0 }, seraDisi: { sabah: -1.9, ogle: 24.0, aksam: 16.6 } },
            { date: '2025-12-03', seraIci: { sabah: 0.6, ogle: 24.0, aksam: 20.6 }, seraDisi: { sabah: -3, ogle: 15.2, aksam: 18.4 } },
            { date: '2025-12-04', seraIci: { sabah: 3.4, ogle: 23.0, aksam: 18.9 }, seraDisi: { sabah: 1.9, ogle: 20.0, aksam: 15.5 } },
            { date: '2025-12-05', seraIci: { sabah: 6.7, ogle: 11.8, aksam: 10.5 }, seraDisi: { sabah: 4.2, ogle: 8.9, aksam: 9.3 } },
            { date: '2025-12-06', seraIci: { sabah: 6.6, ogle: 18.0, aksam: 15.5 }, seraDisi: { sabah: 7.1, ogle: 16.1, aksam: 11.6 } },
            { date: '2025-12-08', seraIci: { sabah: 5.1, ogle: 23.2, aksam: 24.3 }, seraDisi: { sabah: 9.5, ogle: 20.7, aksam: 17.6 } },
            { date: '2025-12-09', seraIci: { sabah: 2.3, ogle: 25.9, aksam: 21.1 }, seraDisi: { sabah: -2.0, ogle: 22.5, aksam: 15.1 } },
            { date: '2025-12-10', seraIci: { sabah: 10.5, ogle: 22.8, aksam: 19.2 }, seraDisi: { sabah: -0.2, ogle: 20.6, aksam: 15.6 } },
            { date: '2025-12-11', seraIci: { sabah: 7.9, ogle: 26.2, aksam: 25.0 }, seraDisi: { sabah: -5.2, ogle: 17.2, aksam: 15.5 } },
            { date: '2025-12-12', seraIci: { sabah: 7.3, ogle: 23.6, aksam: 23.8 }, seraDisi: { sabah: -5.9, ogle: 17.8, aksam: 21.3 } },
            { date: '2025-12-13', seraIci: { sabah: 1.7, ogle: 30.7, aksam: 20.9 }, seraDisi: { sabah: -5.4, ogle: 20.3, aksam: 13.9 }, mazot: 33 },
            { date: '2025-12-14', mazot: 28 },
            { date: '2025-12-15', seraIci: { sabah: 2.6, ogle: 18.0, aksam: 14.3 }, seraDisi: { sabah: null, ogle: 16.8, aksam: 9.6 }, mazot: 38 },
            { date: '2025-12-16', seraIci: { sabah: 7.8, ogle: 24.5, aksam: 20.2 }, seraDisi: { sabah: -7.9, ogle: 19.5, aksam: 10.3 }, mazot: 37 },
            { date: '2025-12-17', seraIci: { sabah: 8.6, ogle: 24.2, aksam: 19.9 }, seraDisi: { sabah: -3.8, ogle: 17.5, aksam: 10.5 }, mazot: 37 },
            { date: '2025-12-18', seraIci: { sabah: 5.9, ogle: 27.2, aksam: 23.3 }, seraDisi: { sabah: -9.2, ogle: 24.4, aksam: 12.3 }, mazot: 35 },
            { date: '2025-12-19', seraIci: { sabah: 6.4, ogle: 22.3, aksam: 19.9 }, seraDisi: { sabah: -7.3, ogle: 26.6, aksam: 12.1 }, mazot: 20 },
            { date: '2025-12-20', seraIci: { sabah: 3.8, ogle: 25.6, aksam: 15.9 }, seraDisi: { sabah: -7.0, ogle: 20.5, aksam: 13.4 }, mazot: 22 },
            { date: '2025-12-22', seraIci: { sabah: 8.6, ogle: 12.4, aksam: 13.0 }, seraDisi: { sabah: 4.9, ogle: 10.0, aksam: 11.1 }, mazot: 7.5 },
            { date: '2025-12-23', seraIci: { sabah: 8.9, ogle: 10.0, aksam: 13.1 }, seraDisi: { sabah: 5.1, ogle: 8.2, aksam: 10.1 } },
            { date: '2025-12-24', seraIci: { sabah: 1.6, ogle: 22.1, aksam: 23.8 }, seraDisi: { sabah: -0.3, ogle: 19.1, aksam: 12.3 }, mazot: 13 },
            { date: '2025-12-25', seraIci: { sabah: 9.0, ogle: 16.0, aksam: 17.3 }, seraDisi: { sabah: 4.8, ogle: 13.4, aksam: 13.0 }, mazot: 13 },
            { date: '2025-12-26', seraIci: { sabah: 9.4, ogle: 15.0, aksam: 13.0 }, seraDisi: { sabah: 2.0, ogle: 12.1, aksam: 10.0 } },
            { date: '2025-12-29', seraIci: { sabah: 0.4, ogle: 9.5, aksam: 14.8 }, seraDisi: { sabah: -11.6, ogle: 21.0, aksam: 3.6 }, mazot: 24 },
            { date: '2025-12-30', seraIci: { sabah: 0.2, ogle: 21.7, aksam: 26.0 }, seraDisi: { sabah: -10.0, ogle: 17.8, aksam: 6.6 }, mazot: 2 },
            { date: '2025-12-31', seraIci: { sabah: 10.8, ogle: 10.7, aksam: 13.4 }, seraDisi: { sabah: 1.1, ogle: 2.9, aksam: 7.1 } },
            { date: '2026-01-01', mazot: 43 },
            { date: '2026-01-02', seraIci: { sabah: 1.7, ogle: 18.6, aksam: 21.7 }, seraDisi: { sabah: -14.0, ogle: 12.2, aksam: 0.7 }, mazot: 30 },
            { date: '2026-01-05', seraIci: { sabah: 9.1, ogle: 20.2, aksam: 21.6 }, seraDisi: { sabah: 0.2, ogle: 10.7, aksam: 12.0 } },
            { date: '2026-01-06', seraIci: { sabah: 8.9, ogle: 23.0, aksam: 21.3 }, seraDisi: { sabah: -1.9, ogle: 16.0, aksam: 13.4 } },
            { date: '2026-01-07', seraIci: { sabah: 12.6, ogle: 28.0, aksam: null }, seraDisi: { sabah: 6.2, ogle: 25.0, aksam: null } },
            { date: '2026-01-08', seraIci: { sabah: 17.8, ogle: 16.7, aksam: 12.7 }, seraDisi: { sabah: 10.3, ogle: 10.0, aksam: 8.6 }, mazot: 14 },
            { date: '2026-01-09', seraIci: { sabah: 9.5, ogle: 23.2, aksam: 18.9 }, seraDisi: { sabah: 0.4, ogle: 18.3, aksam: 3.8 } },
            { date: '2026-01-12', seraIci: { sabah: 9.7, ogle: 17.9, aksam: 12.3 }, seraDisi: { sabah: 0.3, ogle: 10.8, aksam: 3.6 }, mazot: 25 },
            { date: '2026-01-13', seraIci: { sabah: 10.9, ogle: 20.2, aksam: 9.3 }, seraDisi: { sabah: -3.7, ogle: 18.3, aksam: 1.7 }, mazot: 17 },
            { date: '2026-01-14', seraIci: { sabah: 9.9, ogle: 20.2, aksam: 24.9 }, seraDisi: { sabah: -1.4, ogle: 8.0, aksam: 5.6 }, mazot: 22 },
            { date: '2026-01-16', seraIci: { sabah: 8.3, ogle: 27.6, aksam: 24.8 }, seraDisi: { sabah: -2.9, ogle: 25.0, aksam: 11.0 }, mazot: 10 },
            { date: '2026-01-17', seraIci: { sabah: 7.6, ogle: 25.0, aksam: 15.4 }, seraDisi: { sabah: -4.4, ogle: 16.7, aksam: 4.8 }, mazot: 30 },
            { date: '2026-01-19', seraIci: { sabah: 5.2, ogle: 24.0, aksam: 22.3 }, seraDisi: { sabah: -11.9, ogle: 14.1, aksam: 1.6 }, mazot: 45 },
            { date: '2026-01-20', seraIci: { sabah: 3.5, ogle: 20.9, aksam: 18.4 }, seraDisi: { sabah: -10.9, ogle: 11.3, aksam: 2.3 }, mazot: 34 },
            { date: '2026-01-21', seraIci: { sabah: 3.5, ogle: 13.3, aksam: 12.5 }, seraDisi: { sabah: -0.7, ogle: 5.7, aksam: 5.8 }, mazot: 23 },
            { date: '2026-01-22', seraIci: { sabah: 10.4, ogle: 10.8, aksam: 9.3 }, seraDisi: { sabah: 3.8, ogle: 4.5, aksam: 2.6 }, mazot: 14 },
            { date: '2026-01-23', seraIci: { sabah: 11.0, ogle: 9.3, aksam: 11.7 }, seraDisi: { sabah: 1.9, ogle: 4.3, aksam: 5.8 }, mazot: 18 },
            { date: '2026-01-24', seraIci: { sabah: 9.1, ogle: 18.3, aksam: 21.2 }, seraDisi: { sabah: 3.7, ogle: 13.8, aksam: 16.4 }, mazot: 8 },
        ];

        for (const t of temperatureData) {
            await tempRef.add({
                date: new Date(t.date),
                seraIci: t.seraIci || null,
                seraDisi: t.seraDisi || null,
                mazot: t.mazot || null,
                createdAt: new Date(),
            });
        }

        // ═══════════════════════════════════════════════════════════════
        //  7. AKTİVİTE KAYITLARI
        // ═══════════════════════════════════════════════════════════════
        const activities = [
            { date: new Date(), action: 'Veri Yükleme', title: 'Gerçek işletme verileri sisteme yüklendi', icon: '📊', color: 'bg-emerald-50 text-emerald-600' },
            { date: new Date(), action: 'Çelik Üretimi', title: 'Toplam 63.105 adet çelik, 902 viyol - 17 parti', icon: '🌱', color: 'bg-green-50 text-green-600' },
            { date: new Date(), action: 'Satınalma', title: '7 tedarikçiden toplam 7.339+ adet bitki alındı', icon: '🛒', color: 'bg-blue-50 text-blue-600' },
            { date: new Date(), action: 'Sera Takibi', title: 'Sera sıcaklık ve gübre verileri kaydedildi', icon: '🌡️', color: 'bg-amber-50 text-amber-600' },
        ];

        for (const act of activities) {
            await activityRef.add(act);
        }

        return {
            message: `${tenantId} gerçek işletme verileri başarıyla yüklendi.`,
            summary: {
                plants: plantData.length,
                suppliers: suppliers.length,
                purchases: purchaseGroups.length,
                productionBatches: productionBatches.length,
                fertilizerLogs: fertilizerData.length,
                temperatureLogs: temperatureData.length,
            }
        };
    }

    @Delete('clear')
    async clear(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);
        const cols = ['plants', 'production', 'recipes', 'customers', 'orders', 'expenses', 'activity_logs', 'purchases', 'fertilizer_logs', 'temperature_logs'];

        for (const col of cols) {
            const snap = await tenantRef.collection(col).get();
            if (snap.empty) continue;

            // Firestore batch has a 500-operation limit
            const chunks: FirebaseFirestore.DocumentReference[][] = [];
            let currentChunk: FirebaseFirestore.DocumentReference[] = [];
            snap.docs.forEach(doc => {
                currentChunk.push(doc.ref);
                if (currentChunk.length === 499) {
                    chunks.push(currentChunk);
                    currentChunk = [];
                }
            });
            if (currentChunk.length > 0) chunks.push(currentChunk);

            for (const chunk of chunks) {
                const batch = this.firebase.db.batch();
                chunk.forEach(ref => batch.delete(ref));
                await batch.commit();
            }
        }

        return { message: `${tenantId} verileri başarıyla temizlendi.` };
    }
}
