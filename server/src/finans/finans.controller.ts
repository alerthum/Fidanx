import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller('finans')
export class FinansController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Get('expenses')
    async getExpenses(@Query('tenantId') tenantId: string) {
        return this.expensesService.findAll(tenantId);
    }

    @Post('expenses')
    async createExpense(@Query('tenantId') tenantId: string, @Body() data: any) {
        return this.expensesService.create(tenantId, data);
    }

    @Delete('expenses/:id')
    async removeExpense(@Query('tenantId') tenantId: string, @Param('id') id: string) {
        return this.expensesService.remove(tenantId, id);
    }
}
