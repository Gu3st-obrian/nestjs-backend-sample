import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { PolicyDocument } from './policy.schema';

@Injectable()
export class PolicyService extends RepositoryService<PolicyDocument> {

    constructor (
        @InjectModel('Policy')
        protected readonly model: Model<PolicyDocument>,
    ) {
        super(model);
    }
}
