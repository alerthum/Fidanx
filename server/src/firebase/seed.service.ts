import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(private firebase: FirebaseService) { }

    async seedDemoData(tenantId: string) {
        this.logger.log(`Seeding demo data for tenant: ${tenantId}`);

        // 1. Create Sample Plants
        const plantsColl = this.firebase.db.collection('tenants').doc(tenantId).collection('plants');

        const samplePlants = [
            { name: 'Ficus Lyrata (Keman Yapraklı İncir)', category: 'İç Mekan', sku: 'STK-FIC-001' },
            { name: 'Monstera Adansonii (Maymun Maskesi)', category: 'İç Mekan', sku: 'STK-MON-002' },
            { name: 'Lavandula Angustifolia (Lavanta)', category: 'Dış Mekan', sku: 'STK-LAV-003' },
        ];

        const plantDocs: any[] = [];
        for (const p of samplePlants) {
            const doc = await plantsColl.add({ ...p, createdAt: new Date() });
            plantDocs.push({ id: doc.id, ...p });
        }

        // 2. Create a Batch with History (The user's workflow: Mother -> 70-Vyal -> 5x5 -> Big Pot)
        const ficus = plantDocs[0];
        const batchesColl = this.firebase.db.collection('tenants').doc(tenantId).collection('batches');

        const batchData = {
            batchNumber: 'BX-DEMO-001',
            plantId: ficus.id,
            plantName: ficus.name,
            quantity: 500,
            status: 'GROWING',
            currentPotSize: '5x5 Plastik Kap',
            plantedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            source: 'Anaç Ağaç (Bahçe-A1)',
            totalCost: 1250.50, // Cumulative cost
            notes: 'Anaçtan alınan çelikler 70 gözlü viyollerde köklendirildi.',
        };

        const batchDoc = await batchesColl.add(batchData);

        // 3. Add Growth Logs (The History)
        const logsColl = batchDoc.collection('growthLogs');

        await logsColl.add({
            stage: 'VİYOL',
            note: '70 gözlü viyollere dikim yapıldı.',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        });

        await logsColl.add({
            stage: '5x5 KAP',
            note: 'Viyollerden 5x5 plastik kaplara şaşırtma yapıldı.',
            potSize: '5x5 Plastik Kap',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        });

        await logsColl.add({
            stage: 'GÖZLEM',
            note: 'Boy gelişimi takip edildi, genel sağlık durumu iyi.',
            height: 15,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        });

        // 4. Create Sample Customers
        const customersColl = this.firebase.db.collection('tenants').doc(tenantId).collection('customers');
        const sampleCustomers = [
            { name: 'Ankara Peyzaj Mimarlık', erpCode: '120-01-001', city: 'Ankara' },
            { name: 'Ege Çiçekçilik A.Ş.', erpCode: '120-01-002', city: 'İzmir' },
        ];

        for (const c of sampleCustomers) {
            await customersColl.add({ ...c, createdAt: new Date() });
        }

        this.logger.log('Demo data seeding complete.');
    }

    async clearTenantData(tenantId: string) {
        this.logger.log(`Clearing all data for tenant: ${tenantId}`);
        const collections = ['plants', 'batches', 'customers', 'sales'];
        const tenantRef = this.firebase.db.collection('tenants').doc(tenantId);

        for (const col of collections) {
            const snapshot = await tenantRef.collection(col).get();
            const batch = this.firebase.db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    }
}
