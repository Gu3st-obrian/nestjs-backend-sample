import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from './account.schema';
import { CommonModule } from '../common/common.module';
import { WalletModule } from '../wallet/wallet.module';
import { AssociationModule } from '../association/association.module';
import { LinkageModule } from '../linkage/linkage.module';
import { EnterpriseModule } from '../enterprise/enterprise.module';

@Module({
    imports: [
        JwtModule.register({}),

        MongooseModule.forFeature([
            {
                name: 'Account',
                schema: AccountSchema,
            },
        ]),

        CommonModule,

        AssociationModule,

        EnterpriseModule,

        LinkageModule,

        WalletModule,
    ],
    providers: [AccountService],
    controllers: [AccountController],
    exports: [AccountService]
})
export class AccountModule { }
