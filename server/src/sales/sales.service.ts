import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { IntegrationService } from '../integration/integration.service';

@Injectable()
export class SalesService {
    constructor(
        private firebase: FirebaseService,
        private integration: IntegrationService
    ) { }

    private sales(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('sales');
    }

    private customers(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('customers');
    }

    private orders(tenantId: string) {
        return this.firebase.db.collection('tenants').doc(tenantId).collection('orders');
    }

    async createInvoice(tenantId: string, data: { customerId: string, totalAmount: number, invoiceNo: string }) {
        const saleData = {
            ...data,
            date: new Date(),
            isSynced: false,
        };
        const docRef = await this.sales(tenantId).add(saleData);

        this.integration.pushInvoice(tenantId, docRef.id).catch(err => {
            console.error('Failed to sync invoice to ERP:', err);
        });

        return { id: docRef.id, ...saleData };
    }

    async getCustomers(tenantId: string) {
        const snapshot = await this.customers(tenantId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async createCustomer(tenantId: string, data: any) {
        const docRef = await this.customers(tenantId).add({ ...data, createdAt: new Date() });
        return { id: docRef.id, ...data };
    }

    async getOrders(tenantId: string) {
        const snapshot = await this.orders(tenantId).orderBy('orderDate', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            orderDate: doc.data().orderDate?.toDate ? doc.data().orderDate.toDate().toISOString() : doc.data().orderDate
        }));
    }

    async createOrder(tenantId: string, data: any) {
        // Simple stock check can be added here if needed, but usually done at fulfillment
        const docRef = await this.orders(tenantId).add({
            ...data,
            orderDate: new Date(),
            status: data.status || 'Bekliyor',
            createdAt: new Date()
        });

        return { id: docRef.id, ...data };
    }

    async updateOrderStatus(tenantId: string, orderId: string, status: string) {
        const docRef = this.orders(tenantId).doc(orderId);
        const doc = await docRef.get();
        if (!doc.exists) throw new Error('Sipariş bulunamadı.');

        const order = doc.data();
        if (!order) throw new Error('Sipariş verisi bozuk.');

        if (order.status === 'Tamamlandı' && status !== 'Tamamlandı') {
            // Prevent reopening for now or implement stock revert logic
        }

        if (status === 'Tamamlandı' && order.status !== 'Tamamlandı') {
            await this.fulfillOrder(tenantId, order);
        }

        await docRef.update({ status, completedAt: status === 'Tamamlandı' ? new Date() : null });
        return { id: orderId, status };
    }

    private async fulfillOrder(tenantId: string, order: any) {
        if (!order.items || !Array.isArray(order.items)) return;

        for (const item of order.items) {
            if (item.plantId) {
                const plantRef = this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.plantId);
                const plantDoc = await plantRef.get();
                if (plantDoc.exists) {
                    const current = plantDoc.data()?.currentStock || 0;
                    // Prevent negative stock? Or allow with warning? Let's allow but log maybe.
                    // For now, simple deduction.
                    await plantRef.update({
                        currentStock: Math.max(0, current - (Number(item.quantity) || 0))
                    });
                }
            }
        }
    }
}
