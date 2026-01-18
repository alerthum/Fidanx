import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Get('customers')
    async getCustomers(@Query('tenantId') tenantId: string) {
        return this.salesService.getCustomers(tenantId);
    }

    @Post('customers')
    async createCustomer(@Query('tenantId') tenantId: string, @Body() data: any) {
        return this.salesService.createCustomer(tenantId, data);
    }

    @Get('orders')
    async getOrders(@Query('tenantId') tenantId: string) {
        return this.salesService.getOrders(tenantId);
    }

    @Post('orders')
    async createOrder(@Query('tenantId') tenantId: string, @Body() data: any) {
        return this.salesService.createOrder(tenantId, data);
    }

    @Post('invoices')
    async createInvoice(@Query('tenantId') tenantId: string, @Body() data: any) {
        return this.salesService.createInvoice(tenantId, data);
    }
}
