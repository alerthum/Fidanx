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

        // 1. Reçeteler (Recipes)
        const r1 = await recipeRef.add({
            name: 'Genç Çelik Karışımı',
            ingredients: ['%50 Torf', '%50 Perlit', 'Hormon A'],
            instructions: 'Nemli tutun, direkt güneşten koruyun.',
            category: 'Başlangıç'
        });
        const r2 = await recipeRef.add({
            name: 'Saksı Gelişim Karışımı',
            ingredients: ['%70 Bahçe Toprağı', '%20 Yanmış Gübre', '%10 Kum'],
            instructions: 'Haftada 2 kez sulayın.',
            category: 'Gelişim'
        });

        // 2. Ana Ağaçlar (Mother Trees)
        const mt1 = await plantsRef.add({
            name: 'Zeytin Ana Ağacı (Ayvalık)',
            type: 'MOTHER_TREE',
            sku: 'AN-ZY-01',
            kod1: 'ZEYTİN',
            category: 'Meyve',
            createdAt: new Date()
        });
        const mt2 = await plantsRef.add({
            name: 'Ceviz Ana Ağacı (Chandler)',
            type: 'MOTHER_TREE',
            sku: 'AN-CV-01',
            kod1: 'CEVİZ',
            category: 'Meyve',
            createdAt: new Date()
        });

        // 3. Üretim Partileri (Farklı Safhalarda)

        // Safha 1: Yeni Çelikler (Tepside)
        await prodRef.add({
            lotId: 'LOT-2024-ZY-001',
            name: 'Ayvalık Zeytin - Tepsi Safhası',
            quantity: 500,
            stage: 'TEPSİ',
            startDate: new Date(),
            motherTreeId: mt1.id,
            recipeId: r1.id,
            type: 'Çelikleme',
            history: [
                { date: new Date(), action: 'Üretim Başlatıldı', note: 'Ana ağaçtan çelikler alındı.' }
            ]
        });

        // Safha 2: Küçük Saksıya Geçmiş (Şaşırtılmış)
        await prodRef.add({
            lotId: 'LOT-2023-ZY-098',
            name: 'Ayvalık Zeytin - Gelişim Safhası',
            quantity: 250,
            stage: 'KÜÇÜK_SAKSI',
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 ay önce
            motherTreeId: mt1.id,
            recipeId: r2.id,
            type: 'Çelikleme',
            history: [
                { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), action: 'Üretim Başlatıldı' },
                { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), action: 'Şaşırtma (Repotting)', note: 'Tepsiden 15 numara saksıya geçildi.' }
            ]
        });

        // Safha 3: Satışa Hazır (Büyük Saksı)
        await prodRef.add({
            lotId: 'LOT-2023-CV-042',
            name: 'Chandler Ceviz - Satışa Hazır',
            quantity: 120,
            stage: 'SATIŞ_HAZIR',
            startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 ay önce
            motherTreeId: mt2.id,
            recipeId: r2.id,
            type: 'Aşı',
            history: [
                { date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), action: 'Üretim Başlatıldı' },
                { date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), action: 'Aaşılama Yapıldı' },
                { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), action: 'Son Kontrol', note: 'Satışa hazır onayı verildi.' }
            ]
        });

        return { message: `${tenantId} için profesyonel lifecycle demo verileri oluşturuldu.` };
    }

    @Delete('clear')
    async clear(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);

        try {
            const plants = await tenantRef.collection('plants').get();
            const prods = await tenantRef.collection('production').get();
            const firms = await tenantRef.collection('firms').get();
            const recipes = await tenantRef.collection('recipes').get();

            const batch = this.firebase.db.batch();
            plants.docs.forEach(doc => batch.delete(doc.ref));
            prods.docs.forEach(doc => batch.delete(doc.ref));
            firms.docs.forEach(doc => batch.delete(doc.ref));
            recipes.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        } catch (e) {
            // Minimal fallback
            const cols = ['plants', 'production', 'firms', 'recipes'];
            for (const col of cols) {
                const snap = await tenantRef.collection(col).get();
                for (const doc of snap.docs) {
                    await doc.ref.delete();
                }
            }
        }

        return { message: `${tenantId} verileri başarıyla temizlendi.` };
    }
}
