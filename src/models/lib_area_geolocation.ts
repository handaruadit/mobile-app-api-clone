import { model, Schema } from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';

const schema = new Schema(
  {
    _id: {
      type: String
    },
    area_id: {
      type: String,
      required: true
    },
    generic: {
      type: String
    },
    label: {
      type: String
    },
    area_size: {
      type: String
    },
    area_type: {
      type: String
    },
    coordinate: {
      type: [Number],
      index: '2d'
    },
    bmkg_id: {
      type: String
    },
    created_at: {
      type: Date,
      required: true,
      default: new Date()
    }
  },
  {
    timestamps: true,
    timeseries: {
      timeField: 'created_at',
      granularity: 'day'
    }
  }
);

export type LibAreaGeolocationModel = InferSchemaType<typeof schema>;
export type IInverterDataModelOutput = StringIds<LibAreaGeolocationModel>;
export type IInverterDataModelPayload = Omit<LibAreaGeolocationModel, 'createdAt' | 'updatedAt'>;
export interface IParamGetAreaSingle {
  areaId?: string;
  bmkgId?: string;
}

class MongooseModel extends Abstract {
  declare model: Model<LibAreaGeolocationModel>;
  interface: LibAreaGeolocationModel;

  constructor() {
    super();
    this.defineModel();
    schema.index({ coordinate: '2dsphere' });
  }

  defineModel = () => {
    this.model = model('lib_area_geolocation', schema);
  };

  getLibList = async () => {
    const result = await this.model.aggregate([
      {
        $match: {}
      }
    ]);

    return result ? (result as any) : {};
  };

  getAreaSingle = async ({ areaId, bmkgId }: IParamGetAreaSingle) => {
    const matchPipeline = {
      $match: {
        area_id: areaId || undefined,
        bmkg_id: bmkgId || undefined
      }
    };

    const pipeline = [
      // removes unwanted undefined if no value
      JSON.parse(JSON.stringify(matchPipeline))
    ];

    const result = await this.model.aggregate(pipeline);
    const resRestructured = {
      areaId: result[0].area_id,
      generic: result[0].generic,
      label: result[0].label,
      areaSize: result[0].area_size,
      areaType: result[0].area_type,
      coordinate: result[0].coordinate,
      bmkgId: result[0].bmkg_id,
      createdAt: result[0].created_at
    };
    return result ? (resRestructured as any) : {};
  };
  getNearestArea = async ({ coord }: any) => {
    /* Usage */
    // getNearestArea({ coord: [<longitude :Number>, <latitude :Number>] })

    const dbRes: any = await this.model.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coord
          },
          spherical: true,
          distanceField: 'calculated'
          // maxDistance : 100000
        }
      },
      {
        $limit: 1
      }
    ]);

    return dbRes.length ? dbRes[0].area_id : {};
  };
}

const inst = new MongooseModel();
export default inst;
