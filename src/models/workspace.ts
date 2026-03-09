/**
 * Workspace is a site where users devices located.
 * a workspace can have multiple devices.
 * a workspace must have an admin.
 */
import { model, Schema, isValidObjectId, Types } from 'mongoose';
import type { InferSchemaType, Model, PipelineStage } from 'mongoose';

import Abstract from '@/models/abstract';
import { IUserMinimalModel } from '@/types';
import { AvailabilityType, StringIds } from '@/interfaces/common';
import { Entities, Roles, ValidationErrorCodes } from '@/lib/enum';
import { IDeviceModelWithId } from './device';
import { ExpressAccount } from '@/types/express';

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
    location: {
      type: { type: String },
      area: String,
      coordinates: [Number, Number],
      elevation: Number
    },
    language: {
      type: String
    },
    timezone: {
      type: String,
      required: [true, ValidationErrorCodes.TIMEZONE_REQUIRED]
    },
    plnPricePerKwh: Number, // in Rupiah
    userAvgDailyConsumption: Number, // kWh
    userAvgMonthlyExpenses: Number,
    calculatedAvgDailyConsumption: Number, // kWh
    calculatedAvgMonthlyExpenses: Number, // kWh
    avgSunlightPerDay: Number, // hour
    wifiSsid: String,
    wifiPassword: String,
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
  _device?: IDeviceModelWithId;
  _owner?: IUserMinimalModel;
  _members?: (IUserMinimalModel & {
    permissions?: Record<string, string>[];
  })[];
};
export type IWorkspaceModelOutput = StringIds<IWorkspaceModelWithId>;
export type IWorkspaceModelPayload = Omit<IWorkspaceModel, 'createdAt' | 'updatedAt' | 'members' | 'ownerId'> & {
  members?: IWorkspaceModel['members'];
  ownerId?: IWorkspaceModel['ownerId'];
};

class MongooseModel extends Abstract {
  declare model: Model<IWorkspaceModel>;
  interface: IWorkspaceModel;

  constructor() {
    super();
    this.defineModel();
    this.schemas = {
      _owner: '', // default to take all fields
      _members: '',
      _device: ''
    };
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
    schema.virtual('_device', {
      ref: 'Device',
      localField: '_id',
      foreignField: 'workspace',
      justOne: true
    });

    this.model = model('Workspace', schema);
  };

  memberFilter = (account: ExpressAccount, roles?: Roles[]) => {
    return {
      members: {
        $elemMatch: {
          id: account._id,
          permissions: {
            $elemMatch: {
              entity: Entities.WORKSPACE,
              role: {
                $in: roles ?? [Roles.READ, Roles.WRITE, Roles.ADMIN]
              }
            }
          }
        }
      }
    };
  };

  findWorkspacesOfUser = async (
    userId: Types.ObjectId | string,
    roles: Roles[] = [Roles.READ, Roles.WRITE, Roles.ADMIN],
    onlyOwner?: boolean,
    select?: string
  ): Promise<IWorkspaceModelWithId[]> => {
    const pipeline: any[] = [{ ownerId: userId }];
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
    return await this.find<IWorkspaceModelWithId>(
      {
        $or: pipeline
      },
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      select
    );
  };

  // state: online or offline
  filterDevice = (state: AvailabilityType): PipelineStage[] => {
    const modifier: { [key: string]: PipelineStage[] } = {
      online: [
        {
          $lookup: {
            from: 'paneldatas',
            localField: '_id',
            foreignField: 'siteId',
            pipeline: [
              {
                $sort: {
                  sentAt: -1
                }
              },
              {
                $limit: 1
              },
              {
                $project: {
                  lastPing: {
                    $dateDiff: {
                      startDate: '$createdAt',
                      endDate: '$$NOW',
                      unit: 'minute'
                    }
                  },
                  status: 'online'
                  // /* Debugging Parameters */
                  // sentAt: "$sentAt",
                  // datenow: "$$NOW",
                  // dateCreated: "$createdAt"
                }
              },
              {
                $match: {
                  lastPing: {
                    $lte: 2 // 2 minutes
                  }
                }
              }
            ],
            as: 'devicePingStatus'
          }
        },
        {
          $match: {
            devicePingStatus: {
              $ne: []
            }
          }
        }
      ],
      offline: [
        {
          $lookup: {
            from: 'paneldatas',
            localField: '_id',
            foreignField: 'siteId',
            pipeline: [
              {
                $sort: {
                  sentAt: -1
                }
              },
              {
                $limit: 1
              },
              {
                $project: {
                  lastPing: {
                    $dateDiff: {
                      startDate: '$createdAt',
                      endDate: '$$NOW',
                      unit: 'minute'
                    }
                  },
                  status: 'offline'
                  // /* Debugging Parameters */
                  // sentAt: "$sentAt",
                  // datenow: "$$NOW",
                  // dateCreated: "$createdAt"
                }
              },
              {
                $match: {
                  lastPing: {
                    $gt: 2 // 2 minutes
                  }
                }
              }
            ],
            as: 'devicePingStatus'
          }
        },
        {
          $match: {
            devicePingStatus: {
              $ne: []
            }
          }
        }
      ],
      unlinked: [
        {
          $lookup: {
            from: 'paneldatas',
            localField: '_id',
            foreignField: 'siteId',
            as: 'devicePingStatus'
          }
        },
        {
          $match: {
            devicePingStatus: {
              $eq: []
            }
          }
        }
      ]
    };

    return modifier[state];
  };

  getDetailSingleRaw = async ({ workspaceId }: any) => {
    const dbRes: any = await this.model.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(workspaceId)
        }
      }
    ]);

    return dbRes ? (dbRes[0] as any) : {};
  };
}

const inst = new MongooseModel();
export default inst;
