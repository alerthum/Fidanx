import { Module } from '@nestjs/common';
import { FinansController } from './finans.controller';
import { ExpensesService } from './expenses.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    controllers: [FinansController],
    providers: [ExpensesService],
})
export class FinansModule { }
