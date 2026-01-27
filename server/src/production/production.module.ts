import { Module, forwardRef } from '@nestjs/common';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [forwardRef(() => ActivityModule)],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService]
})
export class ProductionModule { }
