import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class CustomersService {
    constructor(private firebase: FirebaseService) { }

    private customers(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('customers');
    }

    async findAll(tenantId: string) {
        const snapshot = await this.customers(tenantId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async create(tenantId: string, data: any) {
        const docRef = await this.customers(tenantId).add({
            ...data,
            createdAt: new Date(),
        });
        return { id: docRef.id, ...data };
    }

    async update(tenantId: string, id: string, data: any) {
        await this.customers(tenantId).doc(id).update(data);
        return { id, ...data };
    }

    async remove(tenantId: string, id: string) {
        await this.customers(tenantId).doc(id).delete();
        return { success: true };
    }
}
