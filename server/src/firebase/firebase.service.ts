import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private _db: any;
    private readonly logger = new Logger(FirebaseService.name);

    onModuleInit() {
        // DECISIVE FIX: Check if we have explicit credentials or skip to mock immediately
        const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG;

        if (!hasCredentials) {
            this.logger.warn('GOOGLE_APPLICATION_CREDENTIALS missing. Switching to MOCK mode to prevent crashes.');
            this.initializeMock();
            return;
        }

        try {
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                });
            }
            this._db = admin.firestore();
            this.logger.log('Firebase initialized successfully with real credentials.');
        } catch (error) {
            this.logger.error('Firebase initialization failed. Falling back to MOCK.', error.stack);
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
