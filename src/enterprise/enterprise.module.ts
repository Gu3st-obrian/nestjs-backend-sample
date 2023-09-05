import { forwardRef, Module } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseController } from './enterprise.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { EnterpriseSchema } from './enterprise.schema';
import { AccountModule } from '../account/account.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Enterprise',
                schema: EnterpriseSchema,
            },
        ]),

        CommonModule,

        WalletModule,

        forwardRef(() => AccountModule),
    ],
    providers: [EnterpriseService],
    exports: [EnterpriseService],
    controllers: [EnterpriseController]
})
export class EnterpriseModule { }
