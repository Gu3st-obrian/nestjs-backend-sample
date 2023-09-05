import { Logger } from '@nestjs/common';
import { Model, Document, QueryOptions } from 'mongoose';
import { IPopulate, RepositoryInterface } from './repository.interface';

export class RepositoryService<T extends Document>
    implements RepositoryInterface<T>
{
    protected readonly logger = new Logger(RepositoryService.name);

    constructor(protected readonly model: Model<T>) { }

    base(): Model<T> {
        return this.model;
    }

    public async create(data: any): Promise<T | null> {
        try {
            this.logger.log('RepositoryService.create.data', data);
            return await this.model.create(data);
        } catch (error) {
            this.logger.error('RepositoryService.create.error', error);
            return null;
        }
    }

    public async findOneBy(
        query: any,
        populate: Array<IPopulate | string> = [],
        fields: any = { _id: 0, password: 0 },
        options: QueryOptions<T> = {}
    ): Promise<T | null> {
        try {
            let builder = null;

            // Set default fields.
            if (!fields) {
                fields = { _id: 0, password: 0 };
            }

            builder = this.model.findOne(query, fields, options);

            populate.forEach((p: any) => {
                builder.populate(p, { _id: 0, password: 0 });
            });
            return await builder.exec();
        } catch (error) {
            this.logger.error('RepositoryService.findOneBy.error', error);
            return null;
        }
    }

    public async findManyBy(
        query: any,
        populate: Array<IPopulate | string> = [],
        fields: any = { _id: 0, password: 0 },
        options: QueryOptions<T> = {}
    ): Promise<T[] | null> {
        try {
            let builder = null;

            // Set default fields.
            if (!fields) {
                fields = { _id: 0, password: 0 };
            }

            // Make proper request.
            builder = this.model.find(query, fields, options);

            // Populate with external model.
            populate.forEach((p: any) => {
                builder.populate(p, { _id: 0 });
            });

            return await builder.exec();
        } catch (error) {
            this.logger.error('RepositoryService.findManyBy.error', error);
            return null;
        }
    }

    public async countDocument(query: any): Promise<number | null> {
        try {
            return await this.model.count(query).exec();
        } catch (error) {
            this.logger.error('RepositoryService.countDocument.error', error);
            return null;
        }
    }

    public async update(filter: any, values: any): Promise<any> {
        try {
            if (Array.isArray(values)) {
                return await this.model.updateMany(filter, values).exec();
            } else {
                return await this.model.updateOne(filter, values).exec();
            }
        } catch (error) {
            this.logger.error('RepositoryService.update.error', error);
            return null;
        }
    }

    public async aggregate(object: any) {
        let skip = 0;
        if (object.page && object.page > 0 && object.limit) {
            skip = ((object.page ? parseInt(object.page) : 1) - 1) * object.limit;
        }
        return await this.model.aggregate([
            {
                $match: {
                    account: object.accountId,
                    $or: [
                        { name: { $regex: object.filter, $options: 'i' } },
                        { reason: { $regex: object.filter, $options: 'i' } },
                    ],
                },
            },
            {
                $facet: {
                    edges: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: parseInt(object.limit) || 15 },
                    ],
                    pageInfo: [
                        {
                            $group: {
                                _id: null,
                                count: {
                                    $sum: 1,
                                },
                            },
                        },
                    ],
                },
            },
        ]);
    }

    transform(record: any): any {
        return record;
    }
}
