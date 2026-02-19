import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class TenantsService {
    constructor(private firebase: FirebaseService) { }

    private get tenants() {
        return this.firebase.db.collection('tenants');
    }

    async create(data: {
        name: string;
        taxNumber?: string;
        address?: string;
        city?: string;
        country?: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
    }) {
        const docRef = await this.tenants.add({
            ...data,
            settings: {
                categories: ['Meyve', 'Süs', 'Endüstriyel'],
                productionStages: ['TEPSİ', 'KÜÇÜK_SAKSI', 'BÜYÜK_SAKSI', 'SATIŞA_HAZIR'],
            },
            createdAt: new Date(),
        });
        return { id: docRef.id, ...data };
    }

    async findAll() {
        try {
            const snapshot = await this.tenants.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('TenantsService.findAll hatası:', error.message);
            throw error;
        }
    }

    async findOne(id: string) {
        try {
            const doc = await this.tenants.doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error(`TenantsService.findOne(${id}) hatası:`, error.message);
            throw error;
        }
    }

    async updateSettings(id: string, settings: any) {
        await this.tenants.doc(id).set({ settings }, { merge: true });
        return { success: true };
    }

    async update(id: string, data: any) {
        await this.tenants.doc(id).update(data);
        return { id, ...data };
    }

    async remove(id: string) {
        await this.tenants.doc(id).delete();
        return { success: true };
    }
}
