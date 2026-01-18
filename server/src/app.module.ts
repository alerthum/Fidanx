import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { TenantsModule } from './tenants/tenants.module';
import { PlantsModule } from './plants/plants.module';
import { ProductionModule } from './production/production.module';
import { SalesModule } from './sales/sales.module';
import { IntegrationModule } from './integration/integration.module';
import { SeedController } from './seed/seed.controller';

@Module({
  imports: [
    FirebaseModule,
    TenantsModule,
    PlantsModule,
    ProductionModule,
    SalesModule,
    IntegrationModule,
  ],
  controllers: [AppController, SeedController],
  providers: [AppService],
})
export class AppModule { }
