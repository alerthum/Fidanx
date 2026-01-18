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
            },
            createdAt: new Date(),
        });
        return { id: docRef.id, ...data };
    }

    async findAll() {
        const snapshot = await this.tenants.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async findOne(id: string) {
        const doc = await this.tenants.doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    async updateSettings(id: string, settings: any) {
        await this.tenants.doc(id).update({ settings });
        return { success: true };
    }
}
