import moment from 'moment-timezone';
import { FilterQuery, Types } from 'mongoose';
import { batteryData, inverterData, panelData } from '@/models';
import cloneDepp from 'lodash.clonedeep';
import {
  DeviceComponentType,
  OutputMainBatteryData,
  OutputMainInverterData,
  OutputMainPanelData,
  PLNPrice,
  SolarPanelDataOutput,
  ITimeseriesAggregate
} from '@/types';
import { IBatteryDataModelOutput } from '@/models/batteryData';
import { IInverterDataModelOutput } from '@/models/inverterData';
import { IPanelDataModelOutput } from '@/models/panelData';
import { IDashboardOutput } from '@/interfaces/endpoints/dashboard';

/**
 * This can be valid if data is coming every second
 * @returns
 */
export const inverterMainFilterGroup = () => {
  return {
    _id: null,
    totalPowerIn: { $sum: '$acPowerIn' },
    totalPowerOut: { $sum: '$acPowerOut' },
    totalConsumption: { $sum: '$acPowerOut' },
    totalAcVoltageIn: { $sum: '$acVoltageIn' },
    totalAcVoltageOut: { $sum: '$acVoltageOut' },
    totalAcCurrenctIn: { $sum: '$acCurrenctIn' },
    totalAcCurrentOut: { $sum: '$acCurrentOut' },
    avgPowerIn: { $avg: '$acPowerIn' },
    avgPowerOut: { $avg: '$acPowerOut' },
    avgConsumption: { $avg: '$acPowerOut' },
    avgAcVoltageIn: { $avg: '$acVoltageIn' },
    avgAcVoltageOut: { $avg: '$acVoltageOut' },
    avgAcCurrenctIn: { $avg: '$acCurrenctIn' },
    avgAcCurrentOut: { $avg: '$acCurrentOut' }
  };
};

export const batteryMainFilterGroup = () => {
  return {
    _id: null,
    totalPower: { $sum: '$power' },
    totalVoltage: { $sum: '$voltage' },
    totalCurrent: { $sum: '$current' },
    avgVoltage: { $sum: '$voltage' },
    avgCurrent: { $sum: '$current' },
    avgPower: { $sum: '$power' },
    avgHumidity: { $sum: '$humidity' },
    avgHeatIndex: { $sum: '$heatIndex' },
    avgTemperature: { $sum: '$temperature' }
  };
};

export const panelMainFilterGroup = () => {
  return {
    _id: null,
    totalPower: { $sum: '$power' },
    totalVoltage: { $sum: '$voltage' },
    totalCurrent: { $sum: '$current' },
    avgVoltage: { $sum: '$voltage' },
    avgCurrent: { $sum: '$current' },
    avgPower: { $sum: '$power' },
    avgLux: { $sum: '$lux' },
    avgTemperature: { $sum: '$temperature' }
  };
};

export const inverterStatsFilterGroup = () => {
  return {
    _id: null,
    powerIn: { $first: '$powerIn' },
    powerOut: { $first: '$powerOut' },
    acVoltageIn: { $first: '$acVoltageIn' },
    acVoltageOut: { $first: '$acVoltageOut' },
    acCurrenctIn: { $first: '$acCurrenctIn' },
    acCurrentOut: { $first: '$acCurrentOut' },
    createdAt: { $first: '$createdAt' },
    sentAt: { $first: '$sentAt' }
  };
};

export const batteryStatsFilterGroup = () => {
  return {
    _id: null,
    power: { $sum: '$power' },
    voltage: { $sum: '$voltage' },
    current: { $sum: '$current' },
    humidity: { $sum: '$humidity' },
    heatIndex: { $sum: '$heatIndex' },
    temperature: { $sum: '$temperature' },
    createdAt: { $first: '$createdAt' },
    sentAt: { $first: '$sentAt' }
  };
};

export const panelStatsFilterGroup = () => {
  return {
    _id: null,
    power: { $sum: '$power' },
    voltage: { $sum: '$voltage' },
    current: { $sum: '$current' },
    lux: { $sum: '$lux' },
    temperature: { $sum: '$temperature' },
    createdAt: { $first: '$createdAt' },
    sentAt: { $first: '$sentAt' }
  };
};

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

interface GetMainStatsOptionsProps {
  deviceIds: (string | Types.ObjectId)[];
  daysAgoStart: number; // how many days ago of data that you need
  daysAgoEnd?: number; // maximum days ago of data that you want to include, maxDaysAgo=10 means that you'll exclude 10 days ago form now
  hoursAgoStart?: number;
  hoursAgoEnd?: number;
  timezone?: string;
  source?: 'aggregator' | 'database';
  componentIncluded?: DeviceComponentType[];
}

export const getMainStats = async ({
  deviceIds,
  daysAgoStart,
  daysAgoEnd,
  hoursAgoStart,
  hoursAgoEnd,
  timezone = 'UTC',
  componentIncluded
}: GetMainStatsOptionsProps): Promise<[OutputMainBatteryData[], OutputMainInverterData[], OutputMainPanelData[], SolarPanelDataOutput]> => {
  const todayStart = moment().tz(timezone).subtract(daysAgoStart, 'days').startOf('day');
  const todayEnd = moment().tz(timezone).subtract(daysAgoEnd, 'days').startOf('day');

  const daysFilter: { $gte: Date; $lte?: Date } = { $gte: todayStart.toDate() };
  if (!isNaN(daysAgoEnd as number)) {
    daysFilter.$lte = todayEnd.toDate();
  }
  const hoursFilter: { $gte?: Date; $lte?: Date } = hoursAgoStart ? { $gte: moment().tz(timezone).subtract(hoursAgoStart, 'hours').toDate() } : {};
  const hoursFilterEnd = hoursAgoEnd ? moment().tz(timezone).subtract(hoursAgoEnd, 'hours').toDate() : undefined;
  if (hoursFilter.$gte && hoursFilterEnd && !isNaN(hoursAgoEnd as number)) {
    hoursFilter.$lte = hoursFilterEnd;
  }

  const basePipeline = [
    {
      $match: {
        createdAt: hoursAgoStart ? hoursFilter : daysFilter,
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

  // we might not need to query all data so we give this option
  const customData = componentIncluded && componentIncluded.length;
  const includeBattery = !customData || (customData && componentIncluded.includes(DeviceComponentType.BATTERY));
  const includeInverter = !customData || (customData && componentIncluded.includes(DeviceComponentType.INVERTER));
  const includePanel = !customData || (customData && componentIncluded.includes(DeviceComponentType.PANEL));
  const rawData = await Promise.all([
    includeBattery ? batteryData.model.aggregate<OutputMainBatteryData>(batteryPipeline) : Promise.resolve([]),
    includeInverter ? inverterData.model.aggregate<OutputMainInverterData>(inverterPipeline) : Promise.resolve([]),
    includePanel ? panelData.model.aggregate<OutputMainPanelData>(panelPipeline) : Promise.resolve([])
  ]);

  const batteryDataResult = rawData[0][0] ?? {};
  const inverterDataResult = rawData[1][0] ?? {};
  const panelDataResult = rawData[2][0] ?? {};

  return [...rawData, calculateSolarPanelData(batteryDataResult, inverterDataResult, panelDataResult)];
};

type GetTimeseriesDataProps = {
  deviceIds: string[] | Types.ObjectId[];
  startTime: Date;
  endTime?: Date;
  aggregate?: ITimeseriesAggregate; // null means do not use aggregate
  timezone?: string;
};

export const getTimeseriesData = async ({ deviceIds, startTime, endTime, aggregate = 'realtime', timezone = 'UTC' }: GetTimeseriesDataProps) => {
  const filter: FilterQuery<any> = {
    createdAt: { $gte: startTime, $lte: endTime },
    deviceId: { $in: deviceIds }
  };
  return Promise.all([
    batteryData.find<IBatteryDataModelOutput>(filter),
    inverterData.find<IInverterDataModelOutput>(filter),
    panelData.find<IPanelDataModelOutput>(filter)
  ]);
};

export function calculateTotalPrice(energyProduced: number, plnPricePerKwh?: number): number {
  const plnPrice = plnPricePerKwh ?? PLNPrice.R1_TR_1300VA;
  const totalPrice = plnPrice * energyProduced;
  return totalPrice;
}

export function calcSavings(energyProduced: number, plnPricePerKwh?: number, userAvgMonthlyExpenses?: number): number {
  const totalPrice = calculateTotalPrice(energyProduced, plnPricePerKwh);
  return Math.max(0, totalPrice - (userAvgMonthlyExpenses ?? 0));
}

export function calcAvgFromData(data: IDashboardOutput[], key: string) {
  const keys = key.split('.') as (keyof (typeof data)[0])[];
  return (
    data.reduce((acc, value) => {
      let val: any = value;
      for (const k of keys) {
        val = val?.[k];
      }
      return acc + (val ?? 0);
    }, 0) / data.length
  );
}
