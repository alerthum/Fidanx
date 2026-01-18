import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ProductionService {
    constructor(private firebase: FirebaseService) { }

    private batches(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('batches');
    }

    async createBatch(tenantId: string, plantId: string, quantity: number) {
        const batchNumber = `BX-${Date.now()}`;
        const data = {
            batchNumber,
            plantId,
            quantity,
            status: 'SOWING',
            plantedAt: new Date(),
        };
        const docRef = await this.batches(tenantId).add(data);
        return { id: docRef.id, ...data };
    }

    async addGrowthLog(tenantId: string, batchId: string, data: { note?: string; photoUrl?: string; height?: number }) {
        const batchRef = this.batches(tenantId).doc(batchId);
        const batch = await batchRef.get();

        if (!batch.exists) {
            throw new NotFoundException('Batch not found');
        }

        const logRef = await batchRef.collection('growthLogs').add({
            ...data,
            createdAt: new Date(),
        });

        return { id: logRef.id, ...data };
    }

    async getBatchDetails(tenantId: string, barcode: string) {
        const snapshot = await this.batches(tenantId)
            .where('batchNumber', '==', barcode)
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new NotFoundException('Batch not found');
        }

        const doc = snapshot.docs[0];
        const logsSnapshot = await doc.ref.collection('growthLogs').orderBy('createdAt', 'desc').get();

        return {
            id: doc.id,
            ...doc.data(),
            growthLogs: logsSnapshot.docs.map(l => ({ id: l.id, ...l.data() })),
        };
    }

    async findAllBatches(tenantId: string) {
        const snapshot = await this.batches(tenantId).orderBy('plantedAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}
