import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpErrorList } from '../app.constant';
import { AccountService } from '../account/account.service';
import { ICommon } from '../common/common.entity';
import { RepositoryService } from '../repository/repository.service';
import { DtoCreateEnterprise } from './enterprise.entity';
import { EnterpriseDocument } from './enterprise.schema';
import { WalletEntityEnum, WalletTypeEnum } from '../wallet/wallet.entity';
import { WalletService } from '../wallet/wallet.service';


@Injectable()
export class EnterpriseService extends RepositoryService<EnterpriseDocument> {

    constructor (
        @InjectModel('Enterprise')
        protected readonly model: Model<EnterpriseDocument>,
        private readonly accountService: AccountService,
        private readonly walletService: WalletService,
    ) {
        super(model);
    }

    public async createEnterprise(inputs: DtoCreateEnterprise) {
        // Get owner Id.
        const foundOwner = await this.accountService.findOneBy({
            pk: inputs.ownerPK
        });

        if (!foundOwner) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                reason: HttpErrorList.UNAVAILABLE_USERNAME,
            } as ICommon;
        }

        //
        const foundEnterprise = await this.findOneBy({
            owner: foundOwner._id,
        });

        if (!foundEnterprise) {
            return {
                statusCode: HttpStatus.EXPECTATION_FAILED,
                reason: HttpErrorList.ENTERPRISE_EXISTS,
            } as ICommon;
        }

        // Create enterprise.
        const createdEnterprise = await this.create({
            name: inputs.name,
            description: inputs.description || "",
            owner: foundOwner._id,
            rccm: inputs.rccm,
            ifu: inputs.ifu,
            wallets: [],
        });

        if (!createdEnterprise) {
            return {
                statusCode: HttpStatus.CONFLICT,
                reason: HttpErrorList.ENTERPRISE_EXISTS,
            } as ICommon;
        }

        // Wallet & Policy.
        const walletIds = [];

        // Create principal wallet.
        let result = await this.walletService.newWallet(WalletEntityEnum.ENTERPRISE, createdEnterprise._id, WalletTypeEnum.PRINCIPAL);
        walletIds.push(result.wallet._id);
        createdEnterprise.wallets.push(result.wallet);

        // Create second wallet.
        result = await this.walletService.newWallet(WalletEntityEnum.ENTERPRISE, createdEnterprise._id, WalletTypeEnum.SECONDAIRE);
        walletIds.push(result.wallet._id);
        createdEnterprise.wallets.push(result.wallet);

        // Add wallets into user model.
        await this.update({ _id: createdEnterprise._id }, {
            $set: {
                wallets: walletIds,
            }
        });

        // 
        return {
            statusCode: HttpStatus.OK,
            values: createdEnterprise,
        } as ICommon;
    }
}
