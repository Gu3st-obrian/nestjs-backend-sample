import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../account/account.service';
import { CommonService } from '../common/common.service';
import { GlobalService } from '../global/global.service';

@Injectable()
export class LoggedMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LoggedMiddleware.name);

    constructor(
        private readonly commonService: CommonService,
        private readonly accountService: AccountService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        this.logger.log('Logged Request...');

        // 
        try {
            const bearer = req.headers.authorization || null;
            if (typeof bearer != 'string' || !bearer.includes('Bearer')) {
                // Login required.
                return this.commonService.render(res, HttpStatus.FORBIDDEN, 'MISSING_TOKEN_SESSION');
            }

            // Extract token.
            const token = bearer.split(' ')[1];

            // Verify Token.
            const content = this.accountService.verifySession(token);

            // Search user.
            const foundedUser = await this.accountService.findOneBy({
                pk: content.pku
            }, ["policies", "wallets"], { password: 0 });
            //
            if (!foundedUser) {
                return this.commonService.render(res, HttpStatus.UNAUTHORIZED, 'USER_NOT_FOUND');
            }

            // Set account for global use.
            GlobalService.account = foundedUser;

            next();

        } catch (err: any) {
            console.log("Errorrrrrr", err);
            this.logger.error("LoggedMiddleware.Error", err);
            return this.commonService.render(res, HttpStatus.UNAUTHORIZED, 'SESSION_EXPIRED');
        }
    }
}
