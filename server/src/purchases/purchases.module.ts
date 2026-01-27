import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [FirebaseModule, ActivityModule],
    controllers: [PurchasesController],
    providers: [PurchasesService],
})
export class PurchasesModule { }
