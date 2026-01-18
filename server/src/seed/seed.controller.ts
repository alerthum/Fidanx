import { Controller, Delete, Query, Post } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('seed')
export class SeedController {
    constructor(private firebase: FirebaseService) { }

    @Post()
    async seed(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);
        const plantsRef = tenantRef.collection('plants');
        const prodRef = tenantRef.collection('production');
        const recipeRef = tenantRef.collection('recipes');
        const firmRef = tenantRef.collection('firms');

        // 1. Profesyonel Reçeteler (Recipes)
        const r1 = await recipeRef.add({
            name: 'Coco-Peat Başlangıç Karışımı',
            ingredients: ['%60 Hindistan Cevizi Kabuğu', '%30 Perlit', '%10 Vermikülit', 'Hormon-B1'],
            instructions: 'Çelikleme safhasında 25°C sabit sıcaklıkta tutun.',
            category: 'Başlangıç'
        });
        const r2 = await recipeRef.add({
            name: 'Genç Fidan Gelişim Karışımı',
            ingredients: ['%40 Torf', '%40 Pomza', '%20 Yanmış Hayvan Gübresi'],
            instructions: 'Küçük saksı değişiminden sonra bol can suyu verin.',
            category: 'Gelişim'
        });
        const r3 = await recipeRef.add({
            name: 'Meyve Ağacı Arazi Karışımı',
            ingredients: ['%70 Kırmızı Toprak', '%20 Kum', '%10 Kireçli Toprak'],
            instructions: 'Açık alan gelişimine uygundur.',
            category: 'Final'
        });

        // 2. Profesyonel Ana Ağaçlar (Mother Trees)
        const mt1 = await plantsRef.add({ name: 'Zeytin Ana Ağacı (Ayvalık)', type: 'MOTHER_TREE', sku: 'AN-ZY-01', kod1: 'ZEYTİN', category: 'Meyve', status: 'ACTIVE' });
        const mt2 = await plantsRef.add({ name: 'Ceviz Ana Ağacı (Chandler)', type: 'MOTHER_TREE', sku: 'AN-CV-01', kod1: 'CEVİZ', category: 'Meyve', status: 'ACTIVE' });
        const mt3 = await plantsRef.add({ name: 'Badem Ana Ağacı (Ferragnes)', type: 'MOTHER_TREE', sku: 'AN-BD-01', kod1: 'BADEM', category: 'Sert Kabuklu', status: 'ACTIVE' });
        const mt4 = await plantsRef.add({ name: 'Şeftali Ana Ağacı (Early Red)', type: 'MOTHER_TREE', sku: 'AN-SF-01', kod1: 'ŞEFTALİ', category: 'Yumuşak Çekirdekli', status: 'ACTIVE' });

        // 3. Uçtan Uca Üretim Partileri (Farklı Safhalarda)

        // BATCH 1: Ayvalık Zeytin - YENİ BAŞLATILDI (Tepside)
        await prodRef.add({
            lotId: 'LOT-2024-ZY-101',
            name: 'Ayvalık Zeytin - 2024 Ocak Dikimi',
            quantity: 1200,
            stage: 'TEPSİ',
            startDate: new Date(),
            motherTreeId: mt1.id,
            recipeId: r1.id,
            type: 'Çelikleme',
            history: [
                { date: new Date(), action: 'Üretim Başlatıldı', note: 'Ana ağaçtan 1200 adet taze çelik alındı.' }
            ]
        });

        // BATCH 2: Chandler Ceviz - GELIŞIMDE (Küçük Saksı)
        const d2 = new Date(); d2.setMonth(d2.getMonth() - 2);
        const d2_move = new Date(); d2_move.setMonth(d2_move.getMonth() - 1);
        await prodRef.add({
            lotId: 'LOT-2023-CV-502',
            name: 'Chandler Ceviz - Gelişim Grubu',
            quantity: 450,
            stage: 'KÜÇÜK_SAKSI',
            startDate: d2,
            motherTreeId: mt2.id,
            recipeId: r2.id,
            type: 'Aşı',
            history: [
                { date: d2, action: 'Üretim Başlatıldı', note: 'Aşılama işlemi için altlıklar hazırlandı.' },
                { date: d2_move, action: 'Saksıya Geçiş (Şaşırtma)', note: 'Tepsiden 2 litrelik saksılara aktarıldı.' }
            ]
        });

        // BATCH 3: Ferragnes Badem - SATIŞA HAZIR (Büyük Saksı/Arazi)
        const d3 = new Date(); d3.setFullYear(d3.getFullYear() - 1);
        await prodRef.add({
            lotId: 'LOT-2023-BD-009',
            name: 'Ferragnes Badem - 1 Yaş Grubu',
            quantity: 85,
            stage: 'SATIŞ_HAZIR',
            startDate: d3,
            motherTreeId: mt3.id,
            recipeId: r3.id,
            type: 'Tohum',
            history: [
                { date: d3, action: 'Üretim Başlatıldı' },
                { date: new Date(d3.getTime() + 90 * 86400000), action: 'Birincil Şaşırtma' },
                { date: new Date(d3.getTime() + 180 * 86400000), action: 'İkincil Şaşırtma (Final Saksı)' },
                { date: new Date(), action: 'Satış Onayı', note: 'Formu ve kök yapısı uygun görüldü.' }
            ]
        });

        // 4. Demo Tedarikçiler
        await firmRef.add({ name: 'Doğa Fidancılık A.Ş.', type: 'SUPPLIER', kod1: 'Hammadde', balance: -15000 });
        await firmRef.add({ name: 'Modern Tarım Lojistik', type: 'SUPPLIER', kod1: 'Nakliye', balance: 0 });

        return { message: `${tenantId} için uçtan uca profesyonel lifecycle demo verileri oluşturuldu.` };
    }

    @Delete('clear')
    async clear(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);
        const cols = ['plants', 'production', 'firms', 'recipes'];

        for (const col of cols) {
            const snap = await tenantRef.collection(col).get();
            const batch = this.firebase.db.batch();
            snap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        return { message: `${tenantId} verileri başarıyla temizlendi.` };
    }
}
