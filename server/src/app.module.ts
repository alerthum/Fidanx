import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { TenantsModule } from './tenants/tenants.module';
import { PlantsModule } from './plants/plants.module';
import { ProductionModule } from './production/production.module';
import { RecipesModule } from './recipes/recipes.module';
import { SalesModule } from './sales/sales.module';
import { FinansModule } from './finans/finans.module';
import { ActivityModule } from './activity/activity.module';
import { IntegrationModule } from './integration/integration.module';
import { SeedController } from './seed/seed.controller';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    TenantsModule,
    PlantsModule,
    ProductionModule,
    RecipesModule,
    SalesModule,
    FinansModule,
    ActivityModule,
    IntegrationModule,
    PurchasesModule,
  ],
  controllers: [AppController, SeedController],
  providers: [AppService],
})
export class AppModule { }
