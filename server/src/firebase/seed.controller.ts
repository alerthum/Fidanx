import { Controller, Post, Delete, Query } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post()
    seed(@Query('tenantId') tenantId: string) {
        return this.seedService.seedDemoData(tenantId);
    }

    @Delete('clear')
    clear(@Query('tenantId') tenantId: string) {
        return this.seedService.clearTenantData(tenantId);
    }
}
