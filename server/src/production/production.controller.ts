import { Controller, Get, Post, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ProductionService } from './production.service';
import { TemperatureService } from './temperature.service';
import { FertilizerService } from './fertilizer.service';

@Controller('production')
export class ProductionController {
    constructor(
        private readonly productionService: ProductionService,
        private readonly temperatureService: TemperatureService,
        private readonly fertilizerService: FertilizerService,
    ) { }

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

    // ── Sera Sıcaklık Ölçümleri ──
    @Get('temperature-logs')
    getTemperatureLogs(@Query('tenantId') tenantId: string) {
        return this.temperatureService.findAll(tenantId);
    }

    @Post('temperature-logs')
    createTemperatureLog(@Query('tenantId') tenantId: string, @Body() body: any) {
        return this.temperatureService.create(tenantId, body);
    }

    @Delete('temperature-logs/:id')
    deleteTemperatureLog(@Query('tenantId') tenantId: string, @Param('id') id: string) {
        return this.temperatureService.remove(tenantId, id);
    }

    // ── Gübre Uygulamaları ──
    @Get('fertilizer-logs')
    getFertilizerLogs(@Query('tenantId') tenantId: string) {
        return this.fertilizerService.findAll(tenantId);
    }

    @Post('fertilizer-logs')
    createFertilizerLog(@Query('tenantId') tenantId: string, @Body() body: any) {
        return this.fertilizerService.create(tenantId, body);
    }

    @Delete('fertilizer-logs/:id')
    deleteFertilizerLog(@Query('tenantId') tenantId: string, @Param('id') id: string) {
        return this.fertilizerService.remove(tenantId, id);
    }
}
