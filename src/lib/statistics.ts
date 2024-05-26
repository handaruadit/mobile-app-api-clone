import moment from 'moment-timezone';
import type { Types } from 'mongoose';
import { batteryData, inverterData, panelData } from '@/models';
import cloneDepp from 'lodash.clonedeep';
import { OutputMainBatteryData, OutputMainInverterData, OutputMainPanelData, SolarPanelDataOutput } from '@/types';
import { IBatteryDataModelOutput } from '@/models/batteryData';
import { IInverterDataModelOutput } from '@/models/inverterData';
import { IPanelDataModelOutput } from '@/models/panelData';

export const inverterMainFilterGroup = () => {
  return {
    _id: null,
    totalPowerIn: { $sum: "$acPowerIn" },
    totalPowerOut: { $sum: "$acPowerOut" },
    totalConsumption: { $sum: "$acPowerOut" },
    totalAcVoltageIn: { $sum: "$acVoltageIn" },
    totalAcVoltageOut: { $sum: "$acVoltageOut" },
    totalAcCurrenctIn: { $sum: "$acCurrenctIn" },
    totalAcCurrentOut: { $sum: "$acCurrentOut" },
    avgPowerIn: { $avg: "$acPowerIn" },
    avgPowerOut: { $avg: "$acPowerOut" },
    avgConsumption: { $avg: "$acPowerOut" },
    avgAcVoltageIn: { $avg: "$acVoltageIn" },
    avgAcVoltageOut: { $avg: "$acVoltageOut" },
    avgAcCurrenctIn: { $avg: "$acCurrenctIn" },
    avgAcCurrentOut: { $avg: "$acCurrentOut" }
  };
}

export const batteryMainFilterGroup = () => {
  return {
    _id: null,
    totalPower: { $sum: "$power" },
    totalVoltage: { $sum: "$voltage" },
    totalCurrent: { $sum: "$current" },
    avgVoltage: { $sum: "$voltage" },
    avgCurrent: { $sum: "$current" },
    avgPower: { $sum: "$power" },
    avgHumidity: { $sum: "$humidity" },
    avgHeatIndex: { $sum: "$heatIndex" },
    avgTemperature: { $sum: "$temperature" },
  };
}

export const panelMainFilterGroup = () => {
  return {
    _id: null,
    totalPower: { $sum: "$power" },
    totalVoltage: { $sum: "$voltage" },
    totalCurrent: { $sum: "$current" },
    avgVoltage: { $sum: "$voltage" },
    avgCurrent: { $sum: "$current" },
    avgPower: { $sum: "$power" },
    avgLux: { $sum: "$lux" },
    avgTemperature: { $sum: "$temperature" },
  };
}

export const inverterStatsFilterGroup = () => {
  return {
    _id: null,
    powerIn: { $first: "$powerIn" },
    powerOut: { $first: "$powerOut" },
    acVoltageIn: { $first: "$acVoltageIn" },
    acVoltageOut: { $first: "$acVoltageOut" },
    acCurrenctIn: { $first: "$acCurrenctIn" },
    acCurrentOut: { $first: "$acCurrentOut" },
    createdAt: { $first: "$createdAt" },
    sentAt: { $first: "$sentAt" }
  };
}

export const batteryStatsFilterGroup = () => {
  return {
    _id: null,
    power: { $sum: "$power" },
    voltage: { $sum: "$voltage" },
    current: { $sum: "$current" },
    humidity: { $sum: "$humidity" },
    heatIndex: { $sum: "$heatIndex" },
    temperature: { $sum: "$temperature" },
    createdAt: { $first: "$createdAt" },
    sentAt: { $first: "$sentAt" }
  };
}

export const panelStatsFilterGroup = () => {
  return {
    _id: null,
    power: { $sum: "$power" },
    voltage: { $sum: "$voltage" },
    current: { $sum: "$current" },
    lux: { $sum: "$lux" },
    temperature: { $sum: "$temperature" },
    createdAt: { $first: "$createdAt" },
    sentAt: { $first: "$sentAt" }
  };
}

export function calculateSolarPanelData(
  batteryData?: OutputMainBatteryData,
  inverterData?: OutputMainInverterData,
  panelData?: OutputMainPanelData
): SolarPanelDataOutput {
  const energyProduced = panelData?.totalPower ?? 0;
  const totalBatteryCharged = batteryData?.totalPower ?? 0;
  const totalEnergyConsumed = inverterData?.totalPowerIn ?? 0;
  const totalBatteryDischarged = inverterData?.totalPowerOut ?? 0;
  const totalSurplusEnergy = energyProduced - totalEnergyConsumed;

  return {
    energyProduced,
    totalBatteryCharged,
    totalEnergyConsumed,
    totalBatteryDischarged,
    totalSurplusEnergy
  };
}

export const getMainStats = async (
  deviceIds: string[] | Types.ObjectId[],
  days: number,
  hours?: number,
  timezone: string = 'UTC'
): Promise<[OutputMainBatteryData[], OutputMainInverterData[], OutputMainPanelData[], SolarPanelDataOutput]> => {
  const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');

  // const deviceList = await device.find<IDeviceModelWithId>({
  //   _id: { $in: deviceIds }
  // });
  // const batteryIds = [];
  // const pvIds = [];
  // const inverterIds = [];

  // deviceList.map((device) => {
  //   batteryIds.push(...(device.batteryIds ?? []));
  //   pvIds.push(...(device.panelIds ?? []));
  //   inverterIds.push(...(device.inverterIds ?? []));
  // });
  const daysFilter = { $gte: todayStart.toDate() };
  const hoursFilter = hours ? { $gte: moment().tz(timezone).subtract(hours, 'hours').toDate() } : undefined;

  const basePipeline = [
    {
      $match: {
        createdAt: hours ? hoursFilter : daysFilter,
        deviceId: { $in: deviceIds }
      }
    },
    {
      $group: {}
    }
  ];
  const inverterPipeline = cloneDepp(basePipeline);
  const batteryPipeline = cloneDepp(basePipeline);
  const panelPipeline = cloneDepp(basePipeline);
  inverterPipeline[1].$group = inverterMainFilterGroup();
  batteryPipeline[1].$group = batteryMainFilterGroup();
  panelPipeline[1].$group = panelMainFilterGroup();

  // @ts-ignore
  const rawData = await Promise.all([
    batteryData.model.aggregate<OutputMainBatteryData>(batteryPipeline),
    inverterData.model.aggregate<OutputMainInverterData>(inverterPipeline),
    panelData.model.aggregate<OutputMainPanelData>(panelPipeline)
  ]);
  return [
    ...rawData,
    calculateSolarPanelData(rawData[0][0], rawData[1][0], rawData[2][0])
  ]
}

export const getTimeseriesData = async (
  deviceIds: string[] | Types.ObjectId[],
  days: number,
  hours?: number,
  timezone: string = 'UTC'
) => {
  const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');
  const daysFilter = { $gte: todayStart.toDate() };
  const hoursFilter = hours ? { $gte: moment().tz(timezone).subtract(hours, 'hours').toDate() } : undefined;

  // const basePipeline = [
  //   {
  //     $match: {
  //       createdAt: hours ? hoursFilter : daysFilter,
  //       deviceId: { $in: deviceIds }
  //     }
  //   },
  //   {
  //     $group: {}
  //   }
  // ];

  const filter = {
    createdAt: hours ? hoursFilter : daysFilter,
    deviceId: { $in: deviceIds }
  }
  return Promise.all([
    batteryData.find<IBatteryDataModelOutput>(filter),
    inverterData.find<IInverterDataModelOutput>(filter),
    panelData.find<IPanelDataModelOutput>(filter)
  ]);
}