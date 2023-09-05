import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CommonService } from '../common/common.service';
import { GlobalService } from '../global/global.service';

@Injectable()
export class PolicyMiddleware implements NestMiddleware {
    private readonly logger = new Logger(PolicyMiddleware.name);

    constructor(
        private readonly commonService: CommonService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        this.logger.log('Policy Request...');

        try {
            // If not provided by other middleware.
            if (!GlobalService?.account?.policies) {
                return this.commonService.render(res, HttpStatus.FAILED_DEPENDENCY, 'UNRECOGNIZE_USER_ACCOUNT');
            }
            
            /**
             * Check user policies before allowing resources access.
             */

            const auth = await this.commonService.emitPolicyVerification(req.baseUrl, req.method, GlobalService.account.policies);
            this.logger.log(`PolicyVerificationResponse: ${auth}`);
            if (auth !== true) {
                return this.commonService.render(res, HttpStatus.FORBIDDEN, 'UNAUTHORIZED_POLICY_ERROR');
            }

            /**
             * End of verification.
             */

             next();

        } catch (error: any) {
            this.logger.error("PolicyMiddleware.Error", error);
            return this.commonService.render(res, HttpStatus.SERVICE_UNAVAILABLE, 'POLICY_SERVICE_UNAVAILABLE');
        }
    }
}
