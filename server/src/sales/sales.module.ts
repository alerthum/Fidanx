import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { IntegrationModule } from '../integration/integration.module';

import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule, IntegrationModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule { }
