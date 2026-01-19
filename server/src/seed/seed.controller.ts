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

        // 3. Reçeteler (Recipes)
        const r1 = await recipeRef.add({
            name: 'Zeytin Çelikleme Karışımı',
            items: [
                { materialId: rm1.id, amount: 0.05 },
                { materialId: rm2.id, amount: 0.01 },
                { materialId: rm4.id, amount: 0.002 }
            ],
            instructions: 'Hormon uygulaması sonrası dikim yapın.',
            category: 'Başlangıç'
        });

        const r2 = await recipeRef.add({
            name: 'Saksılı Gelişim Reçetesi',
            items: [
                { materialId: rm1.id, amount: 0.1 },
                { materialId: rm3.id, amount: 1 },
                { materialId: rm4.id, amount: 0.005 },
                { materialId: rm5.id, amount: 1 }
            ],
            category: 'Gelişim'
        });

        // 4. Müşteriler (Customers)
        const c1 = await custRef.add({ name: 'Bereket Tarım İşletmeleri', phone: '0532 000 00 01', email: 'info@bereket.com', address: 'Antalya, Serik', note: 'Kurumsal müşteri.' });
        const c2 = await custRef.add({ name: 'Yılmaz Fidancılık ve Peyzaj', phone: '0544 111 22 33', address: 'Muğla, Bodrum', note: 'Proje bazlı çalışır.' });
        const c3 = await custRef.add({ name: 'Ege Fidan Pazarı', phone: '0232 444 55 66', address: 'İzmir, Ödemiş', note: 'Toptan alıcı.' });

        // 5. Üretim Partileri (Production Batches)
        const b1Id = `LOT-2024-ZY-001`;
        const b1 = await prodRef.add({
            lotId: b1Id,
            name: 'Ayvalık Zeytin 2024',
            plantName: 'Ayvalık Zeytin - 1 Yaş',
            quantity: 5000,
            stage: 'TEPSİ',
            startDate: new Date(),
            motherTreeId: mt1.id,
            recipeId: r1.id,
            history: [{ date: new Date(), action: 'Üretim Başlatıldı', note: 'Çelikler dikildi.' }]
        });

        const d2 = new Date(); d2.setMonth(d2.getMonth() - 8);
        const b2Id = `LOT-2023-CV-042`;
        const b2 = await prodRef.add({
            lotId: b2Id,
            name: 'Chandler Gelişim',
            plantName: 'Chandler Ceviz - Gelişim Grubu',
            quantity: 1200,
            stage: 'KÜÇÜK_SAKSI',
            startDate: d2,
            motherTreeId: mt2.id,
            recipeId: r2.id,
            history: [
                { date: d2, action: 'Üretim Başlatıldı' },
                { date: new Date(d2.getTime() + 90 * 86400000), action: 'Saksıya Geçiş' }
            ]
        });

        const b3Id = `LOT-2024-ZY-005`;
        const b3 = await prodRef.add({
            lotId: b3Id,
            name: 'Gemlik Dikim',
            plantName: 'Gemlik Zeytin - Yeni Dikim',
            quantity: 3000,
            stage: 'TEPSİ',
            startDate: new Date(),
            motherTreeId: mt3.id,
            recipeId: r1.id,
            history: [{ date: new Date(), action: 'Üretim Başlatıldı' }]
        });

        // 6. Siparişler (Orders)
        await orderRef.add({
            customerId: c1.id,
            customerName: 'Bereket Tarım İşletmeleri',
            totalAmount: 125000,
            status: 'COMPLETED',
            date: d2,
            items: [{ name: 'Aşılanmış Zeytin (2 Yaş)', qty: 1000, price: 125 }]
        });

        await orderRef.add({
            customerId: c2.id,
            customerName: 'Yılmaz Fidancılık ve Peyzaj',
            totalAmount: 42000,
            status: 'PENDING',
            date: new Date(),
            items: [{ name: 'Chandler Ceviz', qty: 300, price: 140 }]
        });

        // 7. Giderler (Expenses) - Maliyet Analizi İçin Kritik
        await expRef.add({ title: 'Ocak Ayı Personel Maaşları', category: 'Personel', amount: 145000, date: new Date() });
        await expRef.add({ title: 'Güneş Paneli Bakım Gideri', category: 'Bakım', amount: 8500, date: new Date() });
        await expRef.add({ title: 'ZY-001 Köklendirme Hormonu', category: 'İlaç/Gübre', amount: 4500, batchId: b1.id, date: new Date() });
        await expRef.add({ title: 'CV-042 Budama İşçiliği', category: 'Personel', amount: 6000, batchId: b2.id, date: d2 });
        await expRef.add({ title: 'ZY-005 Toprak Karışımı Nakliye', category: 'Lojistik', amount: 12000, batchId: b3.id, date: new Date() });

        // 8. Aktivite Kayıtları
        const activities = [
            { date: new Date(), action: 'Yeni Sipariş', title: 'Yılmaz Fidancılık - 300 adet Ceviz', icon: '💰', color: 'bg-emerald-50 text-emerald-600' },
            { date: new Date(Date.now() - 1000000), action: 'MRP Analizi', title: 'ZY-001 için 250 torba torf ihtiyacı', icon: '📈', color: 'bg-blue-50 text-blue-600' },
            { date: new Date(Date.now() - 5000000), action: 'Üretim Güncelleme', title: 'LOT-2023-CV-042 -> ORTA_SAKSI', icon: '🌱', color: 'bg-amber-50 text-amber-600' },
            { date: d2, action: 'Satış Tamamlandı', title: 'Bereket Tarım - 1000 adet Zeytin', icon: '🚚', color: 'bg-purple-50 text-purple-600' }
        ];
        for (const act of activities) {
            await activityRef.add(act);
        }

        return { message: `${tenantId} için genişletilmiş ERP/MRP/Maliyet demo verileri başarıyla oluşturuldu.` };
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
