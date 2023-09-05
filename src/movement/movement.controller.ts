import { Controller, Get, HttpStatus, Logger, Param, Query, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DateTime } from 'luxon';
import { AfricaZoneBJ } from '../app.constant';
import { CommonService } from '../common/common.service';
import { GlobalService } from '../global/global.service';
import { WalletService } from '../wallet/wallet.service';
import { MovementTypeEnum } from './movement.schema';
import { MovementService } from './movement.service';

@ApiTags('Movement')
@Controller('movement')
export class MovementController {
    private readonly logger = new Logger(MovementController.name);

    constructor(
        private readonly service: MovementService,
        private readonly commonService: CommonService,
        private readonly walletService: WalletService,
    ) { }

    @ApiParam({ name: "wallet", type: String })
    @ApiQuery({ name: "page", type: Number, required: false, description: "Page number to show" })
    @ApiQuery({ name: "size", type: Number, required: false, description: "Number of results per page" })
    @ApiQuery({ name: "meta", type: String, required: false, description: "JSON string of field to query set" })
    @ApiOkResponse({ description: "List of user movements" })
    @Get("wallet/:wallet/operations")
    public async getOperation(@Res() res: Response, @Query() query: any, @Param('wallet') wallet: string) {

        // Build request query.
        query = this.commonService.buildQueryRequest(query);

        // Count all movements of this user.
        const total = await this.service.countDocument({ wallet });

        /**
         * TODO: Remove after test
         */

        if (!total || total == 1 || Math.floor(Math.random() * 10) > 5) {
            await this.service.create({
                wallet: wallet,
                amount: Math.floor(Math.random() * 1000),
                nature: MovementTypeEnum.CREDIT,
                uniqueKey: `${Math.floor(Math.random() * 1000)}28825828896075133455288258288912345628825828896075133455288258288912345625829`,
                // signature: "1234567890123456789012345678901234567890",
                motif: "RECHARGE DE COMPTE",
                description: "EFFECTUEE PAR LE COMPTE 95010203 POUR LE CLIENT 98020304",
                virtual: false,
            });
        } else {
            await this.service.create({
                wallet: wallet,
                amount: Math.floor(Math.random() * 100),
                nature: MovementTypeEnum.DEBIT,
                uniqueKey: `${Math.floor(Math.random() * 1000)}28825828896075133455288258288912345628825828896075133455288258288912345625829`,
                // signature: "1234567890123456789012345678901234567890",
                motif: "PAIEMENT SERVICE SBEE",
                description: "EFFECTUEE PAR LE COMPTE 96010203 POUR LE CLIENT 97020304",
                virtual: false,
            });
        }

        /**
         * End of test values.
         */

        // Get requested movements page.
        const results = await this.service.findManyBy({ wallet }, [], { _id: 0, confirmed: 0, signature: 0 }, {
            skip: query.page * query.size,
            limit: query.size,
        });
        
        //
        return this.commonService.render(res, HttpStatus.OK, {
            data: results,
            total: total ? total + 1 : query.size, // TODO: Add +1 for test only.
            page: query.page + 1,
            length: (results && results.length) ? results.length : 0,
        });
    }

    @ApiParam({ name: "wallet", type: String })
    @ApiQuery({ name: "meta", type: String, required: false, description: "JSON string of field to query set" })
    @ApiOkResponse({ description: "Get account balance at some time" })
    @Get("wallet/:wallet/balance")
    public async getBalance(@Res() res: Response, @Query() query: any, @Param('wallet') wallet: string) {

        // 
        query = this.commonService.buildQueryRequest(query);

        const today = (query?.meta?.date) ? DateTime.fromMillis(parseInt(query.meta.date)).toMillis() : DateTime.now().toMillis();

        console.log('Balance Today', today, query);

        // Get requested movements page.
        const results = await this.service.findOneBy({ wallet, createdAt: { $lte: today }}, [], null, {
            sort: { createdAt: -1 }
        });
        
        //
        return this.commonService.render(res, HttpStatus.OK, {
            balance: results?.afterBalance || 0,
            date: DateTime.fromMillis(today).setZone(AfricaZoneBJ).toISO(),
        });
    }

    @ApiOkResponse({ description: "Get account balance at some time" })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: "Unavailable or account wallets not found" })
    @Get("account/balances")
    public async getAccountBalances(@Res() res: Response) {

        // Identify account balance.
        const foundUserWallets = GlobalService.account.wallets;

        if (!foundUserWallets || foundUserWallets.length == 0) {
            return this.commonService.render(res, HttpStatus.EXPECTATION_FAILED, "UNAVAILABLE_WALLETS_ACCOUNT");
        }

        // Get wallets info.
        const wallets = await this.walletService.findManyBy({
            wallet: {
                $in: foundUserWallets
            }
        });

        return this.commonService.render(res, HttpStatus.OK, { wallets });
    }
}
