import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private _db: any;
    private readonly logger = new Logger(FirebaseService.name);

    constructor() {
        // İlk başta her zaman MOCK ile başla (fail-safe)
        this.initializeMock();
    }

    onModuleInit() {
        const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const credJson = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (!credPath && !credJson) {
            this.logger.warn('Firebase kimlik bilgileri bulunamadı. MOCK modunda devam ediliyor.');
            return;
        }

        try {
            if (admin.apps.length === 0) {
                let credential;

                if (credJson) {
                    // JSON string üzerinden (Vercel/Cloud için ideal)
                    try {
                        const serviceAccount = JSON.parse(credJson);
                        credential = admin.credential.cert(serviceAccount);
                        this.logger.log('Firebase initialized using direct JSON content.');
                    } catch (e) {
                        this.logger.error('FIREBASE_SERVICE_ACCOUNT JSON ayrıştırma hatası:', e.message);
                    }
                }

                if (!credential && credPath) {
                    // Dosya yolu üzerinden
                    credential = admin.credential.applicationDefault();
                    this.logger.log(`Firebase initialized using credentials file: ${credPath}`);
                }

                if (credential) {
                    admin.initializeApp({ credential });
                    this._db = admin.firestore();
                    this.logger.log('Firebase Firestore bağlantısı başarıyla kuruldu.');
                }
            } else {
                this._db = admin.firestore();
            }
        } catch (error) {
            this.logger.error('Firebase başlatma hatası (MOCK moduna dönülüyor):', error.message);
            // Zaten constructor'da mocklandığı için bir şey yapmaya gerek yok, 
            // ama yine de temiz olduğundan emin olalım.
            this.initializeMock();
        }
    }

    private initializeMock() {
        const mockBatch = () => ({
            set: () => mockBatch(),
            update: () => mockBatch(),
            delete: () => mockBatch(),
            commit: async () => { },
        });

        const mockDoc = (id: string) => ({
            id: id || 'mock-id',
            ref: { id: id || 'mock-id' },
            get: async () => ({
                exists: id === 'demo-tenant', // Pretend demo tenant exists
                id: id,
                data: () => ({ name: 'Demo Tenant', settings: {} }),
            }),
            set: async () => ({}),
            update: async () => ({}),
            delete: async () => ({}),
            collection: (name: string) => mockCollection(name),
        });

        const mockCollection = (name: string) => ({
            doc: (id: string) => mockDoc(id),
            add: async (data: any) => ({ id: 'mock-' + Math.random().toString(36).substr(2, 9), ...data }),
            get: async () => ({
                docs: [],
                forEach: (cb: any) => [],
                map: (cb: any) => [],
            }),
            where: () => mockCollection(name),
            limit: () => mockCollection(name),
            orderBy: () => mockCollection(name),
        });

        this._db = {
            collection: (name: string) => mockCollection(name),
            doc: (path: string) => mockDoc(path.split('/').pop() || ''),
            batch: () => mockBatch(),
            settings: () => { },
        };
    }

    get db() {
        return this._db;
    }
}
