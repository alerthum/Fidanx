import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class TemperatureService {
    constructor(private firebase: FirebaseService) { }

    private logs(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('temperature_logs');
    }

    async findAll(tenantId: string) {
        const snapshot = await this.logs(tenantId).orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate ? doc.data().date.toDate().toISOString() : doc.data().date,
        }));
    }

    async create(tenantId: string, data: any) {
        const docRef = await this.logs(tenantId).add({
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
            createdAt: new Date(),
        });
        return { id: docRef.id, ...data };
    }

    async remove(tenantId: string, id: string) {
        await this.logs(tenantId).doc(id).delete();
        return { success: true };
    }
}
