import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class ProductionService {
    constructor(
        private firebase: FirebaseService,
        private activity: ActivityService
    ) { }

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

        // MRP: Reçete varsa önce stok kontrolü yap sonra düş
        if (data.recipeId && data.quantity) {
            await this.checkStockAvailability(tenantId, data.recipeId, data.quantity);
        }

        const docRef = await this.production(tenantId).add(finalData);

        if (data.recipeId && data.quantity) {
            await this.deductMaterials(tenantId, data.recipeId, data.quantity);
        }

        // Aktivite Log
        await this.activity.log(tenantId, {
            action: 'Üretim',
            title: `${finalData.lotId} - ${finalData.plantName || 'Bilinmeyen Ürün'} üretimi başlatıldı.`,
            icon: '🌱',
            color: 'bg-emerald-50 text-emerald-600'
        });

        return { id: docRef.id, ...finalData };
    }

    private async checkStockAvailability(tenantId: string, recipeId: string, quantity: number) {
        const recipeDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('recipes').doc(recipeId).get();
        if (!recipeDoc.exists) return;

        const recipe = recipeDoc.data();
        if (!recipe || !recipe.items || !Array.isArray(recipe.items)) return;

        for (const item of recipe.items) {
            if (item.materialId && item.amount) {
                const materialRef = this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.materialId);
                const materialDoc = await materialRef.get();

                if (materialDoc.exists) {
                    const matData = materialDoc.data();
                    const currentStock = matData?.currentStock || 0;
                    const required = item.amount * quantity;

                    if (currentStock < required) {
                        throw new BadRequestException(`${matData?.name || 'Malzeme'} yetersiz. Gerekli: ${required}, Mevcut: ${currentStock}`);
                    }
                } else {
                    throw new BadRequestException('Reçetedeki malzeme stokta bulunamadı.');
                }
            }
        }
    }

    private async deductMaterials(tenantId: string, recipeId: string, quantity: number) {
        try {
            const recipeDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('recipes').doc(recipeId).get();
            if (!recipeDoc.exists) return;

            const recipe = recipeDoc.data();
            if (!recipe || !recipe.items || !Array.isArray(recipe.items)) return;

            for (const item of recipe.items) {
                if (item.materialId && item.amount) {
                    const materialRef = this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.materialId);
                    const materialDoc = await materialRef.get();

                    if (materialDoc.exists) {
                        const matData = materialDoc.data();
                        const currentStock = matData?.currentStock || 0;
                        const deduction = item.amount * quantity;
                        await materialRef.update({
                            currentStock: Math.max(0, currentStock - deduction)
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Stok düşümü sırasında hata:', error);
        }
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
        const doc = await docRef.get();
        const batchData = doc.data();

        if (!doc.exists || !batchData) {
            throw new NotFoundException('Üretim partisi bulunamadı.');
        }

        const updateData: any = { stage };
        if (recipeId) updateData.recipeId = recipeId;

        // MRP: Reçete değiştiyse veya yeni reçete uygulandıysa önce kontrol et sonra stoktan düş
        if (recipeId && batchData?.quantity) {
            await this.checkStockAvailability(tenantId, recipeId, batchData.quantity);
            await docRef.update(updateData);
            await this.deductMaterials(tenantId, recipeId, batchData.quantity);
        } else {
            await docRef.update(updateData);
        }

        await this.addHistoryLog(tenantId, id, {
            action: `Safha Güncellendi: ${stage}`,
            note: recipeId ? `Yeni reçete uygulandı. Stok düşümü yapıldı.` : undefined
        });

        // Aktivite Log
        await this.activity.log(tenantId, {
            action: 'Safha Değişimi',
            title: `${batchData.lotId} -> ${stage} safhasına geçti.`,
            icon: '🚀',
            color: 'bg-blue-50 text-blue-600'
        });

        return { id, stage };
    }
}
