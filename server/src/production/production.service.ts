import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class ProductionService {
    constructor(
        private firebase: FirebaseService,
        @Inject(forwardRef(() => ActivityService))
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
            location: data.location || 'Depo',
            startDate: data.startDate || new Date(),
            history: data.history || [{ date: new Date(), action: 'Üretim Başlatıldı' }],
            accumulatedCost: 0,
            costHistory: []
        };

        // MRP: Reçete varsa maliyet hesapla
        if (data.recipeId && data.quantity) {
            const materialCost = await this.calculateRecipeCost(tenantId, data.recipeId, data.quantity);
            if (materialCost > 0) {
                finalData.accumulatedCost = materialCost;
                finalData.costHistory.push({
                    date: new Date(),
                    amount: materialCost,
                    unitVal: materialCost / data.quantity,
                    description: 'İlk Madde ve Malzeme Gideri (Reçete)',
                    type: 'HAMMADDE'
                });
            }
        }

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

    private async calculateRecipeCost(tenantId: string, recipeId: string, quantity: number): Promise<number> {
        let totalCost = 0;
        try {
            const recipeDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('recipes').doc(recipeId).get();
            if (!recipeDoc.exists) return 0;
            const recipe = recipeDoc.data();
            if (!recipe?.items) return 0;

            for (const item of recipe.items) {
                if (item.materialId && item.amount) {
                    const materialDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.materialId).get();
                    if (materialDoc.exists) {
                        const matData = materialDoc.data();
                        const price = matData?.purchasePrice || 0;
                        totalCost += (item.amount * quantity * price);
                    }
                }
            }
        } catch (e) {
            console.error('Maliyet hesaplama hatası:', e);
        }
        return totalCost;
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
                })),
                costHistory: (data.costHistory || []).map((h: any) => ({
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
            })),
            costHistory: (data.costHistory || []).map((h: any) => ({
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

            // Maliyet Hesabı
            const materialCost = await this.calculateRecipeCost(tenantId, recipeId, batchData.quantity);
            if (materialCost > 0) {
                const currentAccumulated = batchData.accumulatedCost || 0;
                const currentHistory = batchData.costHistory || [];

                updateData.accumulatedCost = currentAccumulated + materialCost;
                updateData.costHistory = [...currentHistory, {
                    date: new Date(),
                    amount: materialCost,
                    unitVal: materialCost / batchData.quantity,
                    description: `Reçete Uygulandı (${stage})`,
                    type: 'HAMMADDE'
                }];
            }

            await docRef.update(updateData);
            await this.deductMaterials(tenantId, recipeId, batchData.quantity);
        } else {
            await docRef.update(updateData);
        }

        // STOK ENTEGRASYONU: Eğer safha SATIŞA_HAZIR ise stoğa ekle
        if (stage === 'SATIŞA_HAZIR' && batchData.stage !== 'SATIŞA_HAZIR' && batchData.plantId && batchData.quantity) {
            const plantRef = this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(batchData.plantId);
            const plantDoc = await plantRef.get();
            if (plantDoc.exists) {
                const currentStock = plantDoc.data()?.currentStock || 0;
                await plantRef.update({
                    currentStock: currentStock + (Number(batchData.quantity) || 0)
                });
                await this.addHistoryLog(tenantId, id, {
                    action: 'Stok Güncellendi',
                    note: `${batchData.quantity} adet stok artışı yapıldı.`
                });
            }
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

    async transferBatch(tenantId: string, id: string, targetLocation: string, note?: string) {
        const docRef = this.production(tenantId).doc(id);
        const doc = await docRef.get();
        if (!doc.exists) throw new NotFoundException('Üretim partisi bulunamadı.');
        const currentData = doc.data();

        await docRef.update({ location: targetLocation });

        await this.addHistoryLog(tenantId, id, {
            action: `Konum Değişimi: ${currentData?.location || 'Belirsiz'} -> ${targetLocation}`,
            note
        });

        await this.activity.log(tenantId, {
            action: 'Transfer',
            title: `${currentData?.lotId} - ${targetLocation} konumuna transfer edildi.`,
            icon: '🚚',
            color: 'bg-amber-50 text-amber-600'
        });

        return { id, location: targetLocation };
    }

    async distributeOperationCost(tenantId: string, locations: string[], totalCost: number, data: any) {
        if (!locations || locations.length === 0 || !totalCost || totalCost <= 0) return;

        // 1. İlgili konumlardaki tüm üretimi bul
        let allBatches: any[] = [];
        for (const loc of locations) {
            const snapshot = await this.production(tenantId).where('location', '==', loc).get();
            snapshot.forEach(doc => allBatches.push({ id: doc.id, ...doc.data() }));
        }

        if (allBatches.length === 0) return;

        // 2. Toplam fidan sayısını hesapla
        const totalQuantity = allBatches.reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0);
        if (totalQuantity === 0) return;

        // 3. Birim başına düşen maliyeti hesapla
        const costPerUnit = totalCost / totalQuantity;

        // 4. Her bir parti için maliyeti işle
        const batchUpdates = allBatches.map(async (batch) => {
            const batchCost = costPerUnit * (Number(batch.quantity) || 0);

            // Mevcut veriler
            const currentAccumulated = Number(batch.accumulatedCost) || 0;
            const currentHistory = Array.isArray(batch.costHistory) ? batch.costHistory : [];

            // Yeni geçmiş kaydı
            const newHistoryItem = {
                date: new Date(),
                amount: batchCost,
                unitVal: costPerUnit, // O andaki birim maliyet etkisi
                description: `${data.title || 'Operasyon'} (${data.action})`,
                type: data.expenseType || 'GENEL',
                refId: data.id || null // Aktivite ID referansı
            };

            await this.production(tenantId).doc(batch.id).update({
                accumulatedCost: currentAccumulated + batchCost,
                costHistory: [...currentHistory, newHistoryItem]
            });
        });

        await Promise.all(batchUpdates);

        return { processedBatches: allBatches.length, totalDistributed: totalCost };
    }

    async migrateSeraLocations(tenantId: string) {
        const batchesRef = this.production(tenantId);
        const snapshot = await batchesRef.get();

        const uniqueLocations = new Set();
        let seraACount = 0;
        const batch = this.firebase.db.batch();

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            uniqueLocations.add(data.location);
            if (data.location === 'Sera A') {
                seraACount++;
                batch.update(doc.ref, { location: 'Sera 1' });
            }
        });

        if (seraACount > 0) {
            await batch.commit();
        }

        return {
            message: `Migrated ${seraACount} batches from Sera A to Sera 1.`,
            foundLocations: Array.from(uniqueLocations),
            totalDocs: snapshot.size
        };
    }
}
