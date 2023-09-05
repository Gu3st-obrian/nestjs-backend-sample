import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { LinkageSchema } from './linkage.schema';
import { LinkageService } from './linkage.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Linkage',
                schema: LinkageSchema,
            },
        ]),

        CommonModule
    ],
    providers: [LinkageService],
    exports: [LinkageService],
})
export class LinkageModule { }
