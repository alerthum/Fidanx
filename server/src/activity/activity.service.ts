import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ActivityService {
    constructor(private firebase: FirebaseService) { }

    private logs(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('activity_logs');
    }

    async log(tenantId: string, data: { action: string, title: string, icon: string, color: string }) {
        return this.logs(tenantId).add({
            ...data,
            date: new Date()
        });
    }

    async findAll(tenantId: string) {
        const snap = await this.logs(tenantId).orderBy('date', 'desc').limit(10).get();
        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
            };
        });
    }
}
