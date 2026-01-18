import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { SeedService } from './seed.service';

@Global()
@Module({
    providers: [FirebaseService, SeedService],
    exports: [FirebaseService, SeedService],
})
export class FirebaseModule { }
