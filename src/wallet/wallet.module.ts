import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletSchema } from './wallet.schema';
import { WalletService } from './wallet.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Wallet',
                schema: WalletSchema,
            },
        ]),
    ],
    providers: [WalletService],
    exports: [WalletService],
})
export class WalletModule { }
