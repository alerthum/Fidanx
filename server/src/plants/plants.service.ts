import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PlantsService {
    constructor(private firebase: FirebaseService) { }

    private plants(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('plants');
    }

    async create(tenantId: string, data: {
        name: string;
        category?: string;
        sku?: string;
        kod1?: string;
        kod2?: string;
        kod3?: string;
        kod4?: string;
        kod5?: string;
        parentId?: string; // Ana Ağaç ID'si
        type?: 'MOTHER_TREE' | 'CUTTING' | 'GRAFT' | 'PACKAGING' | 'RAW_MATERIAL'; // Tip
        volume?: string; // Hacim (Litre vb.)
        dimensions?: string; // Ölçüler (Çap x Yükseklik vb.)
        currentStock?: number; // Mevcut stok miktarı
        wholesalePrice?: number; // Toptan Fiyat
        retailPrice?: number; // Perakende Fiyat
        criticalStock?: number; // Kritik Stok Seviyesi
    }) {
        const docRef = await this.plants(tenantId).add({
            ...data,
            createdAt: new Date(),
        });
        return { id: docRef.id, ...data };
    }

    async findAll(tenantId: string) {
        const snapshot = await this.plants(tenantId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async findOne(tenantId: string, id: string) {
        const doc = await this.plants(tenantId).doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    async findCuttingsByMother(tenantId: string, motherId: string) {
        const snapshot = await this.plants(tenantId).where('parentId', '==', motherId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async update(tenantId: string, id: string, data: any) {
        await this.plants(tenantId).doc(id).update(data);
        return { id, ...data };
    }
}
