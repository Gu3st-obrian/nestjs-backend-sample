import { Document } from 'mongoose';

export interface FilterCriteria {
  page?: number;
  limit?: number;
  sort?: string;
  select?: {};
}

export interface IPopulate {
  path: string;
  fields: any;
}

export interface RepositoryInterface<T extends Document> {
  create(payload: any): Promise<T | null>;

  findOneBy(query: any): Promise<T | null>;

  findManyBy(query: any): Promise<T[]>;

  update(filter: any, values: any): Promise<any>;

  aggregate(object: any): Promise<T[] | T | null>;

  transform(record: any): T[] | T | null;
}
