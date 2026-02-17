import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    create(@Body() data: { name: string; taxNumber?: string }) {
        return this.tenantsService.create(data);
    }

    @Get()
    findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Post(':id/settings')
    updateSettings(@Param('id') id: string, @Body() settings: any) {
        return this.tenantsService.updateSettings(id, settings);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.tenantsService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tenantsService.remove(id);
    }
}
