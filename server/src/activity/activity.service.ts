import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ProductionService } from '../production/production.service';

@Injectable()
export class ActivityService {
    constructor(
        private firebase: FirebaseService,
        @Inject(forwardRef(() => ProductionService))
        private production: ProductionService
    ) { }

    private logs(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('activity_logs');
    }

    async log(tenantId: string, data: any) {
        const docRef = await this.logs(tenantId).add({
            ...data,
            date: new Date()
        });

        // Eğer işlemde maliyet ve konum bilgisi varsa, maliyeti fidanlara dağıt
        if (data.cost && data.cost > 0 && data.locations && Array.isArray(data.locations)) {
            // Arka planda çalıştır, sonucu beklemeye gerek yok veya loglayabiliriz
            this.production.distributeOperationCost(tenantId, data.locations, Number(data.cost), { id: docRef.id, ...data })
                .catch(err => console.error('Maliyet dağıtımı hatası:', err));
        }

        return { id: docRef.id, ...data };
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
