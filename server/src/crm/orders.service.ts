import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class OrdersService {
    constructor(private firebase: FirebaseService) { }

    private orders(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('orders');
    }

    async findAll(tenantId: string) {
        const snapshot = await this.orders(tenantId).orderBy('orderDate', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            orderDate: doc.data().orderDate?.toDate ? doc.data().orderDate.toDate().toISOString() : doc.data().orderDate
        }));
    }

    async create(tenantId: string, data: any) {
        const docRef = await this.orders(tenantId).add({
            ...data,
            orderDate: new Date(),
            status: data.status || 'PENDING', // PENDING, COMPLETED, CANCELLED
            createdAt: new Date(),
        });
        return { id: docRef.id, ...data };
    }

    async updateStatus(tenantId: string, id: string, status: string) {
        await this.orders(tenantId).doc(id).update({ status, updatedAt: new Date() });
        return { id, status };
    }
}
