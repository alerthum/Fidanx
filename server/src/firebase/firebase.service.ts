import { Injectable, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private _db: admin.firestore.Firestore;
    private readonly logger = new Logger(FirebaseService.name);

    onModuleInit() {
        const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const credJson = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (!credPath && !credJson) {
            const msg = 'CRITICAL: Firebase kimlik bilgileri bulunamadı (GOOGLE_APPLICATION_CREDENTIALS veya FIREBASE_SERVICE_ACCOUNT eksik).';
            this.logger.error(msg);
            throw new Error(msg);
        }

        try {
            if (admin.apps.length === 0) {
                let credential;

                if (credJson) {
                    try {
                        const serviceAccount = JSON.parse(credJson);
                        credential = admin.credential.cert(serviceAccount);
                        this.logger.log('Firebase initialized using FIREBASE_SERVICE_ACCOUNT env variable.');
                    } catch (e) {
                        this.logger.error('FIREBASE_SERVICE_ACCOUNT JSON parse error:', e.message);
                        throw e;
                    }
                } else if (credPath) {
                    credential = admin.credential.applicationDefault();
                    this.logger.log(`Firebase initialized using file: ${credPath}`);
                }

                if (credential) {
                    admin.initializeApp({ credential });
                }
            }

            this._db = admin.firestore();
            this.logger.log('Firebase Firestore bağlantısı başarıyla kuruldu.');
        } catch (error) {
            this.logger.error('Firebase bağlantı hatası:', error.message);
            throw new InternalServerErrorException('Veritabanı bağlantısı kurulamadı: ' + error.message);
        }
    }

    get db() {
        if (!this._db) {
            throw new InternalServerErrorException('Veritabanı henüz hazır değil.');
        }
        return this._db;
    }
}
