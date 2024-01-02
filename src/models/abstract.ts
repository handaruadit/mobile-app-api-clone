import {
  AnyKeys,
  startSession,
  FilterQuery,
  Query,
  ClientSession
} from 'mongoose';
import type { Types, Model } from 'mongoose';

import { flattenObject } from '@/lib/util';

interface Action {
  (session: ClientSession): Promise<any>;
}

export default class Abdstract {
  declare model: Model<any>;

  getModel = () => this.model;

  populate = (query: Query<any, any>) => query;

  get = async <T>(id: string, populate?: boolean): Promise<T | undefined> => {
    const query = this.model.findById(id);

    const populated = populate ? this.populate(query) : query;
    const result = await populated.lean();

    return result;
  };

  count = () => this.model.count();
  findOrigin = (o: any) => this.model.find(o);
  findOneAndUpdate = (f: any, u: any) => this.model.findOneAndUpdate(f, u);
  find = async <T>(
    filter: FilterQuery<any>,
    field = 'createdAt',
    order = 'descending',
    limit?: number,
    populate?: boolean
  ): Promise<T[]> => {
    let query = this.model
      .find(filter)
      // @ts-ignore
      .sort({ [field]: order, createdAt: 'descending' });

    if (limit) {
      query = query.limit(limit);
    }

    query = populate ? this.populate(query) : query;

    return await query.lean();
  };

  create = async <T>(payload: AnyKeys<any>): Promise<T> => {
    const doc = await this.model.create(payload);

    const query = this.model.findById(doc._id);

    const result = await query.lean();

    return result;
  };

  update = async <T>(
    id: string | Types.ObjectId,
    payload: AnyKeys<any>,
    overwrite?: boolean
  ): Promise<T> => {
    const payloadSet = overwrite ? payload : flattenObject(payload);

    await this.model.findByIdAndUpdate(id, payloadSet).exec();

    const query = this.model.findById(id);

    const result = await query.lean();

    return result;
  };

  updateWhere = async (
    where: FilterQuery<any>,
    payload: AnyKeys<any>,
    overwrite?: boolean
  ): Promise<any> => {
    const payloadSet = overwrite ? payload : flattenObject(payload);

    return this.model.updateMany(where, payloadSet).exec();
  };

  removeWhere = async (where: FilterQuery<any>): Promise<any> =>
    this.model.deleteMany(where);

  remove = async (_id: string | Types.ObjectId): Promise<any> =>
    await this.model.deleteOne({ _id });

  validate = () => {
    return true;
  };
}

export async function runTransaction(actions: Action[], callback: () => void) {
  const session: ClientSession = await startSession();
  session.startTransaction();

  try {
    await Promise.all(actions.map((action) => action(session)));
    await session.commitTransaction();
    callback();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
