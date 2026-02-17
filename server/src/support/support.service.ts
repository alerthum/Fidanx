
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class SupportService {
    constructor(private firebase: FirebaseService) { }

    private support(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('support_tickets');
    }

    async create(tenantId: string, data: any) {
        const ticketData = {
            ...data,
            status: 'NEW',
            createdAt: new Date(),
            history: [{ action: 'Talebiniz alındı', date: new Date() }]
        };
        const docRef = await this.support(tenantId).add(ticketData);
        return { id: docRef.id, ...ticketData };
    }

    async findAll(tenantId: string) {
        const snapshot = await this.support(tenantId).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
        }));
    }
}
