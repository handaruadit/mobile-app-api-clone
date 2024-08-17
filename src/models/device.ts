import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model, Query } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { Entities, ErrorCodes, Roles, ValidationErrorCodes } from '@/lib/enum';
import workspace, { IWorkspaceModelWithId } from './workspace';

// basically an inverter that send data
const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.NAME_REQUIRED],
      minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
    },
    description: { type: String },
    brand: { type: String },
    isDefault: {
      type: Boolean,
      required: [true, ValidationErrorCodes.DEFAULT_REQUIRED]
    },
    plantedAt: { type: Date },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_COMPANY
      }
    },
    workspace: {
      type: Schema.Types.ObjectId,
      required: false,
      // required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Workspace'
      // validate: {
      //   validator: (v: string) => isValidObjectId(v),
      //   message: ValidationErrorCodes.INVALID_WORKSPACE_ID
      // }
    },
    batteries: {
      type: [
        {
          batteryId: {
            type: Schema.Types.ObjectId,
            ref: 'Battery',
            required: false
          },
          uuid: {
            type: String,
            required: true
          }
        }
      ]
    },
    panels: {
      type: [
        {
          panelId: {
            type: Schema.Types.ObjectId,
            ref: 'Panel',
            required: false
          },
          uuid: {
            type: String,
            required: true
          }
        }
      ]
    },
    inverters: {
      type: [
        {
          inverterId: {
            type: Schema.Types.ObjectId,
            ref: 'Inverter',
            required: false
          },
          uuid: {
            type: String,
            required: true
          }
        }
      ]
    },
    maxPowerOutput: {
      // in Watts
      type: Number
    },
    batteryCapacity: {
      // in MWh
      type: Number
    },
    panelSize: {
      // in m^2
      type: Number
    },
    panelCapacity: {
      // in Watt, single panel capacity
      type: Number
    },
    totalPanel: {
      type: Number
    },
    efficiencyRating: {
      // in % e.g 1 not 100 for 100%,
      // ratio of actual power output to the theoretical maximum power output of the solar panel under ideal conditions
      type: Number
    },
    deratingFactor: {
      // in % e.g 1 not 100 for 100%,
      // factors like temperature, shading, and soiling that reduce the panel's output
      type: Number
    },
    voltageOutput: {
      // in Volts
      type: Number
    },
    material: {
      type: String
    },
    warrantyExpiration: { type: Date },
    inverterType: { type: String },
    // IngressProtection/IP Rating
    weatherResistanceRating: { type: String }
  },
  { timestamps: true }
);

export type IDeviceModel = InferSchemaType<typeof schema>;
export type IDeviceModelWithId = IDeviceModel & {
  _id: Types.ObjectId;
};
export type IDeviceModelPopulated = IDeviceModelWithId & {
  _workspace: IWorkspaceModelWithId;
};
export type IDeviceModelOutput = StringIds<IDeviceModelWithId>;
export type IDeviceModelPayload = Omit<IDeviceModel, 'createdAt' | 'updatedAt'>;

class MongooseModel extends Abstract {
  declare model: Model<IDeviceModel>;
  interface: IDeviceModel;
  defaultAvgSunlightPerDay = 8; // avg time in Indonesia
  defaultEfficiencyRating = 1;
  defaultPanelCapacity = 300;
  defaultDeratingFactor = 0.85;
  defaultPlnPrice = 1440; // Rupiah

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    schema.virtual('_workspace', {
      ref: 'Workspace',
      localField: 'workspace',
      foreignField: '_id',
      justOne: true
    });

    this.model = model('Device', schema);
  };

  populate = (query: Query<any, any>) => query.populate('_workspace', '_id name coordinates location timezone ownerId members');

  isUserHasPermission = async (deviceId: string, userId: Types.ObjectId | string, roles?: Roles[]): Promise<[boolean, string?]> => {
    const device = await this.get<IDeviceModelPopulated>(deviceId, true);
    const workspace = device?._workspace;

    if (!workspace) {
      return [false, ErrorCodes.USER_NOT_AUTHORIZED];
    }

    const member = workspace.members.find(member => member.id.toString() === userId.toString());
    const permission = member?.permissions.find(permission => permission.entity === Entities.WORKSPACE);
    const isOwner = device?._workspace?.ownerId.toString() === userId.toString();
    const hasPermission = member && permission && !!roles && roles.some(role => permission?.role?.includes(role));
    const isAuthorized = isOwner || (!isOwner && (!roles || hasPermission));

    if (!isAuthorized) {
      return [false, ErrorCodes.USER_NOT_AUTHORIZED];
    }

    return [true, undefined];
  };

  findOnlyIds = async (workspaceId: Types.ObjectId | string): Promise<Types.ObjectId[]> => {
    const devices = await this.find<IDeviceModelWithId>({ workspace: workspaceId }, undefined, undefined, undefined, false, undefined, '_id');
    return devices.map(device => device._id);
  };

  findUsersDevices = async (accountId: Types.ObjectId | string) => {
    const workspaces = await workspace.findWorkspacesOfUser(accountId, undefined, undefined, '_id');
    const workspaceIds = workspaces.map(workspace => workspace._id);
    return await this.find<IDeviceModelWithId>({ workspace: { $in: workspaceIds } });
  };

  getDailyEnergyProductionNeeds = (device: IDeviceModelPopulated) => {
    const workspace = device?._workspace;
    const efficiency = device?.efficiencyRating ?? 1;
    if (workspace) {
      const avgConsumption = workspace.userAvgDailyConsumption ?? workspace.calculatedAvgDailyConsumption ?? 0;
      return avgConsumption / efficiency;
    } else {
      return 0;
    }
  };

  // the amount of solar energy that a solar panel can produce under ideal conditions. in kWh
  solarPanelCapacityRequired = (device: IDeviceModelPopulated) => {
    return this.getDailyEnergyProductionNeeds(device) / (device._workspace.avgSunlightPerDay ?? this.defaultAvgSunlightPerDay);
  };

  // capacity with derating factor
  actualSolarPanelCapacityRequired = (device: IDeviceModelPopulated) => {
    return this.solarPanelCapacityRequired(device) / (device.deratingFactor ?? this.defaultDeratingFactor);
  };

  // Ideal number of panels
  idealSolarPanelNumberRequired = (device: IDeviceModelPopulated) => {
    return this.actualSolarPanelCapacityRequired(device) / (device.panelCapacity ?? this.defaultPanelCapacity);
  };

  idealSolarPanelOutput = (device: IDeviceModelPopulated) => {
    const panelCapacity = (device.panelCapacity ?? this.defaultPanelCapacity) / 1000; // kWh
    return (device._workspace.avgSunlightPerDay ?? 8) * panelCapacity * (device?.efficiencyRating ?? this.defaultEfficiencyRating);
  };

  getSolarPanelEfficiency = (device: IDeviceModelPopulated) => {
    // Assuming the efficiency is calculated as the ratio of actual output to the ideal output
    const idealOutput = this.idealSolarPanelOutput(device);

    if (idealOutput === 0 || !device.panelSize) {
      return 0;
    }

    // Calculate the efficiency in %
    return idealOutput / device.panelSize / 1000 / 100;
  };

  // minus means you have excessive energy which can be stored in battery or sold
  getIdealSavingsRate = (device: IDeviceModelPopulated) => {
    const workspace = device._workspace;
    const idealOutput = this.idealSolarPanelOutput(device); //
    const dailyConsumption = workspace.calculatedAvgDailyConsumption ?? workspace.userAvgDailyConsumption ?? 0;
    return (dailyConsumption - idealOutput) * (workspace.plnPricePerKwh ?? this.defaultPlnPrice);
  };
}

const inst = new MongooseModel();
export default inst;
