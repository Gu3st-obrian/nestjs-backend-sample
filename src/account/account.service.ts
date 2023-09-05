import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac } from 'crypto';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { AfricaZoneBJ } from '../app.constant';
import { CommonService } from '../common/common.service';
import { RepositoryService } from '../repository/repository.service';
import { AccountDocument } from './account.schema';

@Injectable()
export class AccountService extends RepositoryService<AccountDocument> {

    private readonly algorithm = 'sha256';
    private jwtOptions: JwtSignOptions = {};

    constructor(
        @InjectModel('Account')
        protected readonly model: Model<AccountDocument>,
        public readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly commonService: CommonService,
    ) {
        super(model);

        // JSON Web Token config.
        this.jwtOptions = {
            secret: configService.get<string>('jwt.secret'),
            expiresIn: configService.get<string>("jwt.expiry"),
        }
    }

    public makeHash(password: string) {
        const secret = this.configService.get<string>("app.secret");
        return createHmac(this.algorithm, secret).update(password).digest('hex');
    }

    private expiryCounter() {
        //
        const $in = this.jwtOptions.expiresIn;
        const $extractString = String($in).match(/[a-z]+$/);
        if ($extractString && $extractString.length > 0) {
            const $extractNumber = String($in).match(/^\d+/);
            if ($extractNumber && $extractNumber.length > 0) {
                const newNumber = Number($extractNumber[0]) + 1;
                return `${newNumber}${$extractString[0]}`;
            }
        }

        return this.jwtOptions.expiresIn;
    }

    public signSession(userPK: string, forRefresh: boolean) {
        //
        let data: any = forRefresh ? {
            cad: DateTime.now().setZone(AfricaZoneBJ).plus({ seconds: 900 }).toMillis(),
            log: this.commonService.generateId(userPK),
        } : {
            cad: DateTime.now().setZone(AfricaZoneBJ).toMillis(),
        };

        data = { ...data, pku: userPK, rft: forRefresh };

        //
        const options = forRefresh ? {
            ...this.jwtOptions,
            expiresIn: this.expiryCounter(), // TODO: Find proper way to add one to this value.
        } : this.jwtOptions;

        return this.jwtService.sign(data, options);
    }

    public verifySession(token: string) {
        return this.jwtService.verify(token, this.jwtOptions);
    }

    public decodeToken(token: string) {
        const content: any = this.jwtService.decode(token, { json: true, complete: true });
        return content?.payload;
    }
}
