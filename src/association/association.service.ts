import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { AssociationDocument } from './association.schema';

@Injectable()
export class AssociationService extends RepositoryService<AssociationDocument> {

    constructor (
        @InjectModel('Association')
        protected readonly model: Model<AssociationDocument>,
    ) {
        super(model);
    }
}
