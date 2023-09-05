import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { LinkageDocument } from './linkage.schema';

@Injectable()
export class LinkageService extends RepositoryService<LinkageDocument> {

    constructor(
        @InjectModel('Linkage')
        protected readonly model: Model<LinkageDocument>,
    ) {
        super(model);
    }
}
