import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
    constructor(private readonly productionService: ProductionService) { }

    @Post('batches')
    createBatch(
        @Query('tenantId') tenantId: string,
        @Body() body: { plantId: string; quantity: number }
    ) {
        return this.productionService.createBatch(tenantId, body.plantId, body.quantity);
    }

    @Get('batches')
    findAll(@Query('tenantId') tenantId: string) {
        return this.productionService.findAllBatches(tenantId);
    }

    @Get('batches/:idOrBarcode')
    findOne(
        @Query('tenantId') tenantId: string,
        @Param('idOrBarcode') idOrBarcode: string
    ) {
        return this.productionService.getBatchDetails(tenantId, idOrBarcode);
    }

    @Post('batches/:id/logs')
    addLog(
        @Query('tenantId') tenantId: string,
        @Param('id') batchId: string,
        @Body() data: any
    ) {
        return this.productionService.addGrowthLog(tenantId, batchId, data);
    }
}
