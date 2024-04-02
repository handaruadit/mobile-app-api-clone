
/**
 * Workspace is a site where users devices located.
 * a workspace can have multiple devices.
 * a workspace must have an admin.
 */
import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model, Query } from 'mongoose';

import Abstract from '@/models/abstract';
import { IUserMinimalModel } from '@/models/user';

import { StringIds } from '@/interfaces/common';
import { Entities, Roles, ValidationErrorCodes } from '@/lib/enum';

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.LANGUAGE_REQUIRED],
      minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
    },
    isDefault: {
      type: Boolean,
      defaultValue: false
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
      elevation: Number
    },
    location: {
      type: { type: String },
      coordinates: [Number, Number]
    },
    language: {
      type: String,
      required: [true, ValidationErrorCodes.LANGUAGE_REQUIRED]
    },
    timezone: {
      type: String,
      required: [true, ValidationErrorCodes.TIMEZONE_REQUIRED]
    },
    plnPricePerKwh: Number, // in Rupiah
    userAvgDailyConsumption: Number, // kWh
    calculatedAvgDailyConsumption: Number, // kWh
    avgSunlightPerDay: Number, // hour
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.OWNER_REQUIRED],
      ref: 'User',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_OWNER
      }
    },
    members: [
      {
        id: {
          type: Schema.Types.ObjectId,
          required: [true, ValidationErrorCodes.MEMBER_ID_REQUIRED],
          ref: 'User',
          validate: {
            validator: (v: string) => isValidObjectId(v),
            message: ValidationErrorCodes.INVALID_MEMBER_ID
          }
        },
        permissions: [
          {
            entity: {
              type: String,
              enum: {
                values: Object.values(Entities),
                message: ValidationErrorCodes.INVALID_ENTITY
              }
            },
            role: {
              type: String,
              enum: {
                values: Object.values(Roles),
                message: ValidationErrorCodes.INVALID_ROLE
              }
            }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

export type IWorkspaceModel = InferSchemaType<typeof schema>;
export type IWorkspaceModelWithId = IWorkspaceModel & {
  _id: Types.ObjectId;
  _owner: IUserMinimalModel;
  _members: (IUserMinimalModel & {
    permissions?: Record<string, string>[];
  })[];
};
export type IWorkspaceModelOutput = StringIds<IWorkspaceModelWithId>;
export type IWorkspaceModelPayload = Omit<
  IWorkspaceModel,
  'createdAt' | 'updatedAt' | 'members' | 'ownerId'
> & {
  members?: IWorkspaceModel['members'];
  ownerId?: IWorkspaceModel['ownerId'];
};

class MongooseModel extends Abstract {
  declare model: Model<IWorkspaceModel>;
  interface: IWorkspaceModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    schema.virtual('_owner', {
      ref: 'User',
      localField: 'ownerId',
      foreignField: '_id',
      justOne: true
    });
    schema.virtual('_members', {
      ref: 'User',
      localField: 'members.id',
      foreignField: '_id'
    });

    this.model = model('Workspace', schema);
  };

  populate = (query: Query<any, any>) =>
    query
      .populate('_owner', '_id name email')
      .populate('_members', '_id name email');

  findWorkspacesOfUser = async (
    userId: Types.ObjectId | string,
    roles: Roles[] = [Roles.READ, Roles.WRITE, Roles.ADMIN],
    onlyOwner?: boolean,
    select?: string
  ): Promise<IWorkspaceModelWithId[]> => {
    const pipeline: any[] = [ { ownerId: userId } ];
    if (!onlyOwner) {
      pipeline.push({
        members: {
          $elemMatch: {
            id: userId,
            permissions: {
              $elemMatch: {
                entity: Entities.WORKSPACE,
                role: {
                  $in: roles
                }
              }
            }
          }
        }
      });
    }
    return await this.find<IWorkspaceModelWithId>({
      $or: pipeline
    }, undefined, undefined, undefined, false, undefined, select);
  }
}

const inst = new MongooseModel();
export default inst;
