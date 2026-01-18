import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PlantsService } from './plants.service';

@Controller('plants')
export class PlantsController {
    constructor(private readonly plantsService: PlantsService) { }

    @Post()
    create(@Query('tenantId') tenantId: string, @Body() data: any) {
        return this.plantsService.create(tenantId, data);
    }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        return this.plantsService.findAll(tenantId);
    }

    @Get(':id')
    findOne(@Query('tenantId') tenantId: string, @Param('id') id: string) {
        return this.plantsService.findOne(tenantId, id);
    }
}
