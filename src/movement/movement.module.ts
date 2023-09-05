import { Module } from '@nestjs/common';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementSchema } from './movement.schema';
import { CommonModule } from '../common/common.module';
import { WalletModule } from '../wallet/wallet.module';
import { GlobalModule } from '../global/global.module';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: 'Movement',
            schema: MovementSchema,
        }]),

        CommonModule,

        GlobalModule,

        WalletModule,
    ],
    providers: [MovementService],
    controllers: [MovementController],
    exports: [MovementService],
})
export class MovementModule { }
