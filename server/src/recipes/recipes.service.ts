import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class RecipesService {
    constructor(private firebase: FirebaseService) { }

    async findAll(tenantId: string) {
        const snapshot = await this.firebase.db
            .collection('tenants')
            .doc(tenantId)
            .collection('recipes')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async create(tenantId: string, data: any) {
        const docRef = await this.firebase.db
            .collection('tenants')
            .doc(tenantId)
            .collection('recipes')
            .add({
                ...data,
                createdAt: new Date()
            });
        return { id: docRef.id, ...data };
    }

    async update(tenantId: string, id: string, data: any) {
        await this.firebase.db
            .collection('tenants')
            .doc(tenantId)
            .collection('recipes')
            .doc(id)
            .update(data);
        return { id, ...data };
    }

    async remove(tenantId: string, id: string) {
        await this.firebase.db
            .collection('tenants')
            .doc(tenantId)
            .collection('recipes')
            .doc(id)
            .delete();
        return { success: true };
    }
}
