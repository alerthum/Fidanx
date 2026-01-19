import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    controllers: [ActivityController],
    providers: [ActivityService],
    exports: [ActivityService]
})
export class ActivityModule { }
