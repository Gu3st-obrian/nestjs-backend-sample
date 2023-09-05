import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { MovementDocument } from './movement.schema';

@Injectable()
export class MovementService extends RepositoryService<MovementDocument> {

    constructor (
        @InjectModel('Movement')
        protected readonly model: Model<MovementDocument>,
    ) {
        super(model);
    }
}
