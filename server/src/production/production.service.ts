import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ProductionService {
    constructor(private firebase: FirebaseService) { }

    private production(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('production');
    }

    async createBatch(tenantId: string, data: any) {
        const lotId = data.lotId || `LOT-${Date.now()}`;
        const finalData = {
            ...data,
            lotId,
            stage: data.stage || 'TEPSİ',
            startDate: data.startDate || new Date(),
            history: data.history || [{ date: new Date(), action: 'Üretim Başlatıldı' }]
        };
        const docRef = await this.production(tenantId).add(finalData);
        return { id: docRef.id, ...finalData };
    }

    async addHistoryLog(tenantId: string, batchId: string, log: { action: string; note?: string }) {
        const docRef = this.production(tenantId).doc(batchId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException('Üretim partisi bulunamadı.');
        }

        const data = doc.data();
        if (!data) throw new NotFoundException('Veri bulunamadı.');
        const history = data.history || [];
        history.push({ ...log, date: new Date() });

        await docRef.update({ history });
        return { id: batchId, history };
    }

    async findAll(tenantId: string) {
        const snapshot = await this.production(tenantId).orderBy('startDate', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Tarihleri ISO string'e çevirerek client tarafında sorunsuz okunmasını sağlıyoruz
                startDate: data.startDate?.toDate ? data.startDate.toDate().toISOString() : data.startDate,
                history: (data.history || []).map((h: any) => ({
                    ...h,
                    date: h.date?.toDate ? h.date.toDate().toISOString() : h.date
                }))
            };
        });
    }

    async findOne(tenantId: string, id: string) {
        const docRef = this.production(tenantId).doc(id);
        const doc = await docRef.get();

        let data: any;
        let finalId = id;

        if (!doc.exists) {
            const snap = await this.production(tenantId).where('lotId', '==', id).limit(1).get();
            if (snap.empty) throw new NotFoundException('Parti bulunamadı.');
            data = snap.docs[0].data();
            finalId = snap.docs[0].id;
        } else {
            data = doc.data();
        }

        return {
            id: finalId,
            ...data,
            startDate: data.startDate?.toDate ? data.startDate.toDate().toISOString() : data.startDate,
            history: (data.history || []).map((h: any) => ({
                ...h,
                date: h.date?.toDate ? h.date.toDate().toISOString() : h.date
            }))
        };
    }

    async updateStage(tenantId: string, id: string, stage: string, recipeId?: string) {
        const docRef = this.production(tenantId).doc(id);
        const updateData: any = { stage };
        if (recipeId) updateData.recipeId = recipeId;

        await docRef.update(updateData);
        await this.addHistoryLog(tenantId, id, {
            action: `Safha Güncellendi: ${stage}`,
            note: recipeId ? `Yeni reçete uygulandı.` : undefined
        });

        return { id, stage };
    }
}
