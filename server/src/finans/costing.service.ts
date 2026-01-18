import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class CostingService {
    constructor(private firebase: FirebaseService) { }

    async calculateBatchCost(tenantId: string, batchId: string) {
        // 1. Parti verilerini al
        const batchDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('production').doc(batchId).get();
        if (!batchDoc.exists) return null;
        const batch = batchDoc.data();
        if (!batch) return null;

        // 2. Hammadde maliyetlerini bul (Reçete üzerinden)
        let materialCost = 0;
        if (batch.recipeId) {
            const recipeDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('recipes').doc(batch.recipeId).get();
            const recipe = recipeDoc.data();
            if (recipe && recipe.items) {
                for (const item of recipe.items) {
                    const matDoc = await this.firebase.db.collection('tenants').doc(tenantId).collection('plants').doc(item.materialId).get();
                    const mat = matDoc.data();
                    // Hammadde birim fiyatı 
                    const unitPrice = mat?.retailPrice || mat?.wholesalePrice || 0;
                    materialCost += (item.amount * unitPrice * (batch.quantity || 0));
                }
            }
        }

        // 3. Bu partiye özel atanmış giderleri al
        const expensesSnapshot = await this.firebase.db.collection('tenants').doc(tenantId).collection('expenses').where('batchId', '==', batchId).get();
        const allocatedExpenses = expensesSnapshot.docs.reduce((acc, doc) => acc + (parseFloat(doc.data().amount) || 0), 0);

        const totalCost = materialCost + allocatedExpenses;
        const unitCost = batch.quantity > 0 ? totalCost / batch.quantity : 0;

        return {
            batchId,
            lotId: batch.lotId,
            plantName: batch.plantName,
            materialCost,
            allocatedExpenses,
            totalCost,
            unitCost,
            quantity: batch.quantity
        };
    }

    async getOverallAnalytics(tenantId: string) {
        const productionSnapshot = await this.firebase.db.collection('tenants').doc(tenantId).collection('production').get();
        const analyticsList: any[] = [];

        for (const doc of productionSnapshot.docs) {
            const costData = await this.calculateBatchCost(tenantId, doc.id);
            if (costData) analyticsList.push(costData);
        }

        return analyticsList;
    }
}
