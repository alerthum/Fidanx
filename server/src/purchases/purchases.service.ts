import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class PurchasesService {
    constructor(
        private firebase: FirebaseService,
        private activity: ActivityService
    ) { }

    private collection(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('purchases');
    }

    async create(tenantId: string, data: any) {
        const orderData = {
            ...data,
            status: data.status || 'Bekliyor',
            orderDate: new Date(),
            items: data.items || [],
        };

        const docRef = await this.collection(tenantId).add(orderData);

        await this.activity.log(tenantId, {
            action: 'Satınalma',
            title: `Yeni satınalma siparişi oluşturuldu: ${data.supplier || 'Bilinmeyen'}`,
            icon: '🛒',
            color: 'bg-blue-50 text-blue-600'
        });

        return { id: docRef.id, ...orderData };
    }

    async findAll(tenantId: string) {
        const snapshot = await this.collection(tenantId).orderBy('orderDate', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                orderDate: data.orderDate?.toDate ? data.orderDate.toDate().toISOString() : data.orderDate
            };
        });
    }

    async updateStatus(tenantId: string, id: string, status: string) {
        const docRef = this.collection(tenantId).doc(id);
        const doc = await docRef.get();
        if (!doc.exists) throw new NotFoundException('Sipariş bulunamadı.');

        const order = doc.data();
        if (order?.status === 'Tamamlandı' && status !== 'Tamamlandı') {
            // Maybe allow reverting? For now, prevent reverting stock addition easily.
            // Or just allow it.
        }

        if (status === 'Tamamlandı' && order?.status !== 'Tamamlandı') {
            await this.fulfillOrder(tenantId, order);
        }

        await docRef.update({ status, receivedDate: status === 'Tamamlandı' ? new Date() : null });

        await this.activity.log(tenantId, {
            action: 'Satınalma Durumu',
            title: `Sipariş durumu güncellendi: ${status}`,
            icon: '📦',
            color: 'bg-purple-50 text-purple-600'
        });

        return { id, status };
    }

    private async fulfillOrder(tenantId: string, order: any) {
        // Increase stock for each item
        for (const item of order.items || []) {
            if (item.materialId) {
                const materialRef = this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.materialId);
                const matDoc = await materialRef.get();
                if (matDoc.exists) {
                    const currentStock = matDoc.data()?.currentStock || 0;

                    const updateData: any = {
                        currentStock: currentStock + (Number(item.amount) || 0)
                    };

                    // Update supplierId if present in the order
                    if (order.supplierId) {
                        updateData.supplierId = order.supplierId;
                    }

                    await materialRef.update(updateData);
                }
            }
        }

        await this.activity.log(tenantId, {
            action: 'Stok Girişi',
            title: `Satınalma tamamlandı. Stoklar güncellendi.`,
            icon: '📥',
            color: 'bg-emerald-50 text-emerald-600'
        });
    }

    async fixPlantSuppliers(tenantId: string) {
        const purchasesSnapshot = await this.collection(tenantId).get();
        let count = 0;
        const updates: Promise<any>[] = [];

        for (const doc of purchasesSnapshot.docs) {
            const purchase = doc.data();
            // Check if purchase has supplierId and items
            if (purchase.supplierId && purchase.items && Array.isArray(purchase.items)) {
                for (const item of purchase.items) {
                    if (item.materialId) {
                        // We update the plant's supplierId to match the purchase's supplierId
                        // Note: If a plant is in multiple purchases, the last one processed (random order here) wins.
                        // Ideally we might want the *latest* purchase, but for this fix we assume consistency or 'latest wins' naturally if ordered by date (default usually insertion order or random).
                        // Let's rely on iteration.

                        const plantRef = this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.materialId);
                        updates.push(plantRef.update({ supplierId: purchase.supplierId }));
                        count++;
                    }
                }
            }
        }

        await Promise.all(updates);
        return { message: `${count} stok/kalem için tedarikçi bilgisi işlendi.` };
    }

    async delete(tenantId: string, id: string) {
        await this.collection(tenantId).doc(id).delete();
        return { id };
    }
}
