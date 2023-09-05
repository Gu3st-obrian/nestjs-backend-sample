import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { WalletDocument } from './wallet.schema';

@Injectable()
export class WalletService extends RepositoryService<WalletDocument> {

    constructor (
        @InjectModel('Wallet')
        protected readonly model: Model<WalletDocument>,
    ) {
        super(model);
    }
}
