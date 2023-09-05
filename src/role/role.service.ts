import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { RoleDocument } from './role.schema';

@Injectable()
export class RoleService extends RepositoryService<RoleDocument> {

    constructor (
        @InjectModel('Role')
        protected readonly model: Model<RoleDocument>,
    ) {
        super(model);
    }
}
