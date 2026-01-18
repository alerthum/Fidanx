import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as sql from 'mssql';

@Injectable()
export class IntegrationService {
    private readonly logger = new Logger(IntegrationService.name);

    constructor(private firebase: FirebaseService) { }

    async getNetsisConfig(tenantId: string) {
        const doc = await this.firebase.db.collection('tenants').doc(tenantId).collection('configs').doc('netsis').get();
        return doc.exists ? doc.data() : null;
    }

    async syncCustomers(tenantId: string) {
        const config = await this.getNetsisConfig(tenantId) as any;
        if (!config || config.erpType !== 'NETSIS' || !config.sqlServerIp) {
            this.logger.warn(`No Netsis configuration found for tenant ${tenantId}`);
            return;
        }

        const sqlConfig: sql.config = {
            user: config.sqlUser,
            password: config.sqlPass,
            database: config.sqlDbName,
            server: config.sqlServerIp,
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        };

        try {
            const pool = await sql.connect(sqlConfig);
            const result = await pool.request().query(
                'SELECT CARI_KOD, CARI_UNVAN, VERGI_NUMARASI FROM TBLCARISUB'
            );

            const customerColl = this.firebase.db.collection('tenants').doc(tenantId).collection('customers');

            for (const row of result.recordset) {
                // Find existing by erpCode
                const existing = await customerColl.where('erpCode', '==', row.CARI_KOD).limit(1).get();

                const customerData = {
                    erpCode: row.CARI_KOD,
                    name: row.CARI_UNVAN,
                    taxNumber: row.VERGI_NUMARASI,
                    updatedAt: new Date(),
                };

                if (existing.empty) {
                    await customerColl.add({ ...customerData, createdAt: new Date() });
                } else {
                    await existing.docs[0].ref.update(customerData);
                }
            }
            this.logger.log(`Synced ${result.recordset.length} customers for tenant ${tenantId}`);
            await pool.close();
        } catch (err) {
            this.logger.error(`Netsis sync error for tenant ${tenantId}:`, err);
        }
    }

    async pushInvoice(tenantId: string, invoiceId: string) {
        this.logger.log(`Pushing invoice ${invoiceId} to Netsis for tenant ${tenantId}`);
        // implementation for Netsis invoice injection goes here
    }
}
