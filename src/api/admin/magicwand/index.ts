import { Request } from 'express';

import { Types } from 'mongoose';
import { batteryData, inverterData, panelData } from '@/models';
import { IBatteryDataModelWithId, IBatteryDataModel } from '@/models/batteryData';
import { IInverterDataModelWithId, IInverterDataModel } from '@/models/inverterData';
import { IPanelDataModelWithId, IPanelDataModel } from '@/models/panelData';

import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    post: async ({ body, params }: Request, res) => {
      try {
        /* batteryData */
        // find all data
        const selectAllFromBattery: IBatteryDataModelWithId[] = await batteryData.find({ siteId: { $ne: null } });

        // delete first
        for (let i = 0; i < selectAllFromBattery.length; i++) {
          await batteryData.remove(selectAllFromBattery[i]._id);
        }

        // then insert
        for (let i = 0; i < selectAllFromBattery.length; i++) {
          const payload: IBatteryDataModel = {
            sentAt: selectAllFromBattery[i].sentAt,
            metadata: selectAllFromBattery[i].metadata.raw,
            siteId: new Types.ObjectId(`${selectAllFromBattery[i].siteId}`.length < 24 ? '6653341ada81ff67f28cb57c' : `${selectAllFromBattery[i].siteId}`),
            deviceId: selectAllFromBattery[i].deviceId,
            temperature: selectAllFromBattery[i].temperature,
            uuid: selectAllFromBattery[i].uuid,
            current: selectAllFromBattery[i].current,
            voltage: selectAllFromBattery[i].voltage,
            updatedAt: selectAllFromBattery[i].updatedAt,
            humidity: selectAllFromBattery[i].humidity,
            power: selectAllFromBattery[i].power,
            createdAt: selectAllFromBattery[i].createdAt,
            heatIndex: selectAllFromBattery[i].heatIndex
          };

          await batteryData.create(payload);
        }

        /* inverterData */
        // find all data
        const selectAllFromInverter: IInverterDataModelWithId[] = await inverterData.find({ siteId: { $ne: null } });

        // delete first
        for (let i = 0; i < selectAllFromInverter.length; i++) {
          await inverterData.remove(selectAllFromInverter[i]._id);
        }

        // then insert
        for (let i = 0; i < selectAllFromInverter.length; i++) {
          const payload: IInverterDataModel = {
            sentAt: selectAllFromInverter[i].sentAt,
            metadata: selectAllFromInverter[i].metadata,
            siteId: new Types.ObjectId(`${selectAllFromInverter[i].siteId}`.length < 24 ? '6653341ada81ff67f28cb57c' : `${selectAllFromInverter[i].siteId}`),
            deviceId: selectAllFromInverter[i].deviceId,
            uuid: selectAllFromInverter[i].uuid,
            acCurrentIn: selectAllFromInverter[i].acCurrentIn,
            acCurrentOut: selectAllFromInverter[i].acCurrentOut,
            acVoltageIn: selectAllFromInverter[i].acVoltageIn,
            acVoltageOut: selectAllFromInverter[i].acVoltageOut,
            acPowerIn: selectAllFromInverter[i].acPowerIn,
            acPowerOut: selectAllFromInverter[i].acPowerOut,
            createdAt: selectAllFromInverter[i].createdAt,
            updatedAt: selectAllFromInverter[i].updatedAt
          };

          await inverterData.create(payload);
        }

        /* panelData */
        // find all data
        const selectAllFromPanel: IPanelDataModelWithId[] = await panelData.find({ siteId: { $ne: null } });

        // delete first
        for (let i = 0; i < selectAllFromPanel.length; i++) {
          await panelData.remove(selectAllFromPanel[i]._id);
        }

        // then insert
        for (let i = 0; i < selectAllFromPanel.length; i++) {
          const payload: IPanelDataModel = {
            uuid: selectAllFromPanel[i].uuid,
            siteId: new Types.ObjectId(`${selectAllFromPanel[i].siteId}`.length < 24 ? '6653341ada81ff67f28cb57c' : `${selectAllFromPanel[i].siteId}`),
            deviceId: selectAllFromPanel[i].deviceId,
            metadata: selectAllFromPanel[i].metadata,
            sentAt: selectAllFromPanel[i].sentAt,
            inverterId: selectAllFromPanel[i].inverterId,
            voltage: selectAllFromPanel[i].voltage,
            current: selectAllFromPanel[i].current,
            power: selectAllFromPanel[i].power,
            lux: selectAllFromPanel[i].lux,
            temperature: selectAllFromPanel[i].temperature,
            isOnline: selectAllFromPanel[i].isOnline,
            createdAt: selectAllFromPanel[i].createdAt,
            updatedAt: selectAllFromPanel[i].updatedAt
          };

          await panelData.create(payload);
        }

        res.json('Ok, wait for finish');
      } catch (error) {
        Exception.parseError(res, error);
        console.log(error);
      }
    }
  });
