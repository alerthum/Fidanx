import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
    constructor(private readonly productionService: ProductionService) { }

    @Post('batches')
    createBatch(
        @Query('tenantId') tenantId: string,
        @Body() body: any
    ) {
        return this.productionService.createBatch(tenantId, body);
    }

    @Get('batches')
    findAll(@Query('tenantId') tenantId: string) {
        return this.productionService.findAll(tenantId);
    }

    @Get('batches/:id')
    findOne(
        @Query('tenantId') tenantId: string,
        @Param('id') id: string
    ) {
        return this.productionService.findOne(tenantId, id);
    }

    @Patch('batches/:id/stage')
    updateStage(
        @Query('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: { stage: string; recipeId?: string }
    ) {
        return this.productionService.updateStage(tenantId, id, body.stage, body.recipeId);
    }

    @Post('batches/:id/history')
    addHistory(
        @Query('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: { action: string; note?: string }
    ) {
        return this.productionService.addHistoryLog(tenantId, id, body);
    }
    @Patch('batches/:id/transfer')
    transferBatch(
        @Query('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() body: { targetLocation: string; note?: string }
    ) {
        return this.productionService.transferBatch(tenantId, id, body.targetLocation, body.note);
    }
}
