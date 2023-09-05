import { Module } from '@nestjs/common';
import { AssociationService } from './association.service';
import { AssociationController } from './association.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { AssociationSchema } from './association.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Association',
                schema: AssociationSchema,
            },
        ]),

        CommonModule
    ],
    providers: [AssociationService],
    exports: [AssociationService],
    controllers: [AssociationController]
})
export class AssociationModule { }
