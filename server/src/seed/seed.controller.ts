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

        // 1. Ana Ağaçlar (Mother Trees)
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

        // 2. Bu ağaçlardan üretilen dallar/fidanlar (Cuttings)
        await plantsRef.add({
            name: 'Zeytin Çeliği (Ayvalık Genç)',
            type: 'CUTTING',
            sku: 'ZY-CL-01',
            parentId: mt1.id,
            kod1: 'ZEYTİN',
            category: 'Meyve',
            createdAt: new Date()
        });

        // 3. Üretim Partileri
        await prodRef.add({
            name: '2024-Kış Zeytin Üretimi',
            quantity: 1200,
            startDate: new Date(),
            status: 'GROWING',
            motherTreeId: mt1.id,
            type: 'Çelikleme'
        });

        return { message: `${tenantId} için hiyerarşik demo veriler oluşturuldu.` };
    }

    @Delete('clear')
    async clear(@Query('tenantId') tenantId: string) {
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);

        try {
            const plants = await tenantRef.collection('plants').get();
            const prods = await tenantRef.collection('production').get();
            const firms = await tenantRef.collection('firms').get();

            const batch = this.firebase.db.batch();
            plants.docs.forEach(doc => batch.delete(doc.ref));
            prods.docs.forEach(doc => batch.delete(doc.ref));
            firms.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        } catch (e) {
            // Fallback for mock or failed batch
            await tenantRef.collection('plants').get().then(s => s.docs.forEach(d => d.ref.delete()));
            await tenantRef.collection('production').get().then(s => s.docs.forEach(d => d.ref.delete()));
        }

        return { message: `${tenantId} verileri (Stoklar, Üretim, Firmalar) başarıyla temizlendi.` };
    }
}
