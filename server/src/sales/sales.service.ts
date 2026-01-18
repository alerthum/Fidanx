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
        const snapshot = await this.firebase.db.collection('tenants').doc(tenantId).collection('customers').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}
