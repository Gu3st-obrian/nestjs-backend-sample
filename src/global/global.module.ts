import { Module } from '@nestjs/common';
import { GlobalService } from './global.service';

@Module({
    providers: [
        GlobalService,
        {
            provide: 'AliasedGlobalService',
            useExisting: GlobalService,
        }
    ],
    exports: [GlobalService]
})
export class GlobalModule { }
