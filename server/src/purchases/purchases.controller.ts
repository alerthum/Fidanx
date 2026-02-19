import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
    constructor(private readonly service: PurchasesService) { }

    @Post()
    create(@Query('tenantId') tenantId: string, @Body() body: any) {
        return this.service.create(tenantId, body);
    }

    @Post('fix-suppliers')
    fixSuppliers(@Query('tenantId') tenantId: string) {
        return this.service.fixPlantSuppliers(tenantId);
    }

    @Get()
    findAll(@Query('tenantId') tenantId: string) {
        return this.service.findAll(tenantId);
    }

    @Patch(':id/status')
    updateStatus(
        @Query('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body('status') status: string
    ) {
        return this.service.updateStatus(tenantId, id, status);
    }

    @Delete(':id')
    delete(@Query('tenantId') tenantId: string, @Param('id') id: string) {
        return this.service.delete(tenantId, id);
    }
}
