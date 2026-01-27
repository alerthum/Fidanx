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
                name: 'Fidanx Demo İşletmesi',
                settings: {
                    categories: ['Meyve', 'Süs', 'Endüstriyel'],
                    productionStages: ['TEPSİ', 'KÜÇÜK_SAKSI', 'BÜYÜK_SAKSI', 'SATIŞA_HAZIR'],
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
        const orderRef = tenantRef.collection('orders');
        const expRef = tenantRef.collection('expenses');
        const activityRef = tenantRef.collection('activity_logs');

        // 1. Hammaddeler (Raw Materials)
        const rm1 = await plantsRef.add({ name: 'Klasmann TS1 Torf (200L)', type: 'RAW_MATERIAL', currentStock: 250, wholesalePrice: 850, unit: 'Torba', kod1: 'TOPRAK' });
        const rm2 = await plantsRef.add({ name: 'İthal Perlit (100L)', type: 'RAW_MATERIAL', currentStock: 120, wholesalePrice: 320, unit: 'Torba', kod1: 'HAMMADDE' });
        const rm3 = await plantsRef.add({ name: '17\'lik Standart Saksı', type: 'RAW_MATERIAL', currentStock: 15000, wholesalePrice: 4.5, unit: 'Adet', kod1: 'SARF' });
        const rm4 = await plantsRef.add({ name: 'Osmocote Akıllı Gübre', type: 'RAW_MATERIAL', currentStock: 100, wholesalePrice: 4200, unit: 'Kg', kod1: 'GÜBRE' });
        const rm5 = await plantsRef.add({ name: 'Bitki Destek Çubuğu (120cm)', type: 'RAW_MATERIAL', currentStock: 5000, wholesalePrice: 12, unit: 'Adet', kod1: 'SARF' });

        // 2. Ana Ağaçlar (Mother Trees)
        const mt1 = await plantsRef.add({ name: 'Ayvalık Zeytin (Damızlık-A)', type: 'MOTHER_TREE', sku: 'AN-ZY-A', active: true });
        const mt2 = await plantsRef.add({ name: 'Chandler Ceviz (Damızlık-01)', type: 'MOTHER_TREE', sku: 'AN-CV-01', active: true });
        const mt3 = await plantsRef.add({ name: 'Gemlik Zeytin (Damızlık-B)', type: 'MOTHER_TREE', sku: 'AN-ZY-B', active: true });

        // 3. Reçeteler (Recipes) & Materials Linked by ID
        const r1 = await recipeRef.add({
            name: 'Zeytin Çelikleme Karışımı',
            description: 'Standart köklendirme ortamı',
            items: [
                { materialId: rm1.id, name: 'Klasmann TS1 Torf', amount: 0.05, unit: 'Torba' },
                { materialId: rm2.id, name: 'İthal Perlit', amount: 0.01, unit: 'Torba' },
                { materialId: rm4.id, name: 'Osmocote Gübre', amount: 0.002, unit: 'Kg' }
            ],
            category: 'Başlangıç'
        });

        const r2 = await recipeRef.add({
            name: 'Saksılı Gelişim Reçetesi',
            description: 'Saksı büyütme harcı',
            items: [
                { materialId: rm1.id, name: 'Klasmann TS1 Torf', amount: 0.1, unit: 'Torba' },
                { materialId: rm3.id, name: '17\'lik Saksı', amount: 1, unit: 'Adet' },
                { materialId: rm5.id, name: 'Destek Çubuğu', amount: 1, unit: 'Adet' }
            ],
            category: 'Gelişim'
        });

        // 4. Müşteriler (Customers) - Regional Addresses for Map Analysis
        const c1 = await custRef.add({ name: 'Bereket Tarım', phone: '0532 000 00 01', email: 'info@bereket.com', address: 'Serik, Antalya', region: 'Akdeniz', note: 'Kurumsal müşteri.' });
        const c2 = await custRef.add({ name: 'Yılmaz Fidancılık', phone: '0544 111 22 33', address: 'Bodrum, Muğla', region: 'Ege', note: 'Proje bazlı.' });
        const c3 = await custRef.add({ name: 'Anadolu Peyzaj', phone: '0505 123 45 67', address: 'Çankaya, Ankara', region: 'İç Anadolu', note: 'Kamu ihaleleri.' });
        const c4 = await custRef.add({ name: 'Marmara Botanik', phone: '0533 999 88 77', address: 'Nilüfer, Bursa', region: 'Marmara', note: 'Büyük ölçekli alıcı.' });
        const c5 = await custRef.add({ name: 'Karadeniz Orman Ürünleri', phone: '0462 333 22 11', address: 'Ortahisar, Trabzon', region: 'Karadeniz', note: 'Fidanlık.' });

        // 5. Üretim Partileri (Production Batches) with Health Status & Cost History
        const d_now = new Date();
        const d_old = new Date(); d_old.setMonth(d_old.getMonth() - 6);

        // Batch 1: Sağlıklı, Maliyetli
        const b1Id = `LOT-2024-ZY-001`;
        const b1 = await prodRef.add({
            lotId: b1Id,
            name: 'Ayvalık Zeytin 2024',
            plantName: 'Ayvalık Zeytin - 1 Yaş',
            quantity: 5000,
            stage: 'TEPSİ',
            location: 'Sera A',
            subLocation: 'Masa 1-5',
            startDate: new Date(),
            motherTreeId: mt1.id,
            recipeId: r1.id,
            accumulatedCost: 12500, // Initial cost
            history: [
                { date: new Date(), action: 'Üretim Başlatıldı', note: 'Çelikler dikildi.' },
                { date: new Date(), amount: 12500, unitVal: 2.5, description: 'Başlangıç Materyali ve İşçilik', type: 'MALZEME' }
            ],
            costHistory: [
                { date: new Date(), amount: 12500, unitVal: 2.5, description: 'Başlangıç Materyali ve İşçilik', type: 'MALZEME' }
            ]
        });

        // Batch 2: Kritik (Hastalık Riski)
        const b2Id = `LOT-2023-CV-042`;
        const b2 = await prodRef.add({
            lotId: b2Id,
            name: 'Chandler Ceviz - Riskli Grup',
            plantName: 'Chandler Ceviz - 2 Yaş',
            quantity: 1200,
            stage: 'TEPSİ', // Uzun süre tepside kalmış -> Gözlem/Risk
            location: 'Karantina Bölgesi',
            startDate: d_old,
            motherTreeId: mt2.id,
            recipeId: r2.id,
            accumulatedCost: 45000,
            history: [
                { date: d_old, action: 'Üretim Başlatıldı' },
                { date: new Date(), action: 'Kontrol', note: 'Yapraklarda sararma tespit edildi. Kök çürüklüğü riski.' } // Keyword for health status logic
            ],
            costHistory: [
                { date: d_old, amount: 20000, unitVal: 16.6, description: 'Tohum Maliyeti', type: 'MALZEME' },
                { date: new Date(), amount: 25000, unitVal: 20.8, description: 'İlaçlama ve Bakım', type: 'BAKIM' }
            ]
        });

        // Batch 3: Sağlıklı
        const b3 = await prodRef.add({
            lotId: 'LOT-2024-DEFNE-11',
            name: 'Defne Fidanı',
            quantity: 8000,
            stage: 'KÜÇÜK_SAKSI',
            location: 'Açık Alan 2',
            startDate: new Date(),
            accumulatedCost: 32000,
            costHistory: [{ date: new Date(), amount: 32000, unitVal: 4, description: 'Saksılama Maliyeti', type: 'İŞÇİLİK' }]
        });

        // Batch 4: Gözlem Altında (Uzun Süre)
        const d_mid = new Date(); d_mid.setDate(d_mid.getDate() - 75);
        const b4 = await prodRef.add({
            lotId: 'LOT-OBS-099',
            name: 'Altın Çanak',
            quantity: 2500,
            stage: 'TEPSİ',
            startDate: d_mid, // > 60 days in Tray -> Observation
            accumulatedCost: 5000,
            costHistory: []
        });


        // 6. Siparişler (Orders) - Mapping to Regions via Address
        await orderRef.add({ customerId: c1.id, customerName: 'Bereket Tarım', totalAmount: 125000, status: 'COMPLETED', date: d_old, shippingAddress: 'Serik, Antalya', items: [{ name: 'Aşılanmış Zeytin', qty: 1000, price: 125 }] });
        await orderRef.add({ customerId: c2.id, customerName: 'Yılmaz Fidancılık', totalAmount: 42000, status: 'PENDING', date: new Date(), shippingAddress: 'Bodrum, Muğla', items: [{ name: 'Ceviz', qty: 300, price: 140 }] });
        await orderRef.add({ customerId: c4.id, customerName: 'Marmara Botanik', totalAmount: 280000, status: 'SHIPPED', date: new Date(), shippingAddress: 'Bursa, Nilüfer', items: [{ name: 'Mazı', qty: 2000, price: 140 }] });
        await orderRef.add({ customerId: c3.id, customerName: 'Anadolu Peyzaj', totalAmount: 85000, status: 'COMPLETED', date: new Date(), shippingAddress: 'Çankaya, Ankara', items: [{ name: 'Çam Fidanı', qty: 500, price: 170 }] });
        await orderRef.add({ customerId: c5.id, customerName: 'Karadeniz Orman', totalAmount: 64000, status: 'COMPLETED', date: new Date(), shippingAddress: 'Trabzon, Merkez', items: [{ name: 'Ladin', qty: 400, price: 160 }] });


        // 7. Giderler (Expenses)
        await expRef.add({ title: 'Ocak Ayı Personel Maaşları', category: 'Personel', amount: 145000, date: new Date() });
        await expRef.add({ title: 'Sera Isıtma Gideri (Doğalgaz)', category: 'Enerji', amount: 32000, date: new Date() });
        await expRef.add({ title: 'Damlama Sulama Boruları', category: 'Demirbaş', amount: 15000, date: new Date() });

        // 8. Aktivite Kayıtları
        const activities = [
            { date: new Date(), action: 'Yeni Sipariş', title: 'Yılmaz Fidancılık - 300 adet Ceviz', icon: '💰', color: 'bg-emerald-50 text-emerald-600' },
            { date: new Date(Date.now() - 3600000), action: 'Maliyet Girişi', title: 'Sera A İlaçlama - 450 TL/Parti', icon: '💵', color: 'bg-rose-50 text-rose-600' },
            { date: new Date(Date.now() - 7200000), action: 'Üretim Transfer', title: 'LOT-2024-ZY-001 -> Sera A', icon: '🚛', color: 'bg-blue-50 text-blue-600' },
            { date: new Date(Date.now() - 86400000), action: 'Sağlık Uyarısı', title: 'Karantina Bölgesinde riskli yapraklar', icon: '⚠️', color: 'bg-amber-50 text-amber-600' }
        ];
        for (const act of activities) {
            await activityRef.add(act);
        }

        return { message: `${tenantId} demo verileri (Bölgesel Satışlar, Sağlık Analizleri, Maliyet Geçmişi) ile güncellendi.` };
    }

    @Delete('clear')
    async clear(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);
        const cols = ['plants', 'production', 'recipes', 'customers', 'orders', 'expenses', 'activity_logs'];

        for (const col of cols) {
            const snap = await tenantRef.collection(col).get();
            const batch = this.firebase.db.batch();
            snap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        return { message: `${tenantId} verileri başarıyla temizlendi.` };
    }
}
