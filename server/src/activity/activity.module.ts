import { Module, forwardRef } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ProductionModule } from '../production/production.module';

@Module({
    imports: [FirebaseModule, forwardRef(() => ProductionModule)],
    controllers: [ActivityController],
    providers: [ActivityService],
    exports: [ActivityService]
})
export class ActivityModule { }
