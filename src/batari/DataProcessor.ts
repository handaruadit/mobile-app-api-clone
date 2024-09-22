//@ts-nocheck
import { BusinessRuleValidationError } from '@/lib/error';
import { ISitesData, ITimeseriesAggregate, ITimeseriesStatsOutput, StatsOutput } from '@/types';
import * as dfd from 'danfojs-node';
import { BaseDataOptionType } from 'danfojs-node/dist/danfojs-base/shared/types';
import { Model } from 'mongoose';

export interface IMainStatsOptions {
  timezone?: string;
  days?: number;
  hours?: number;
  startTime?: Date;
  endTime?: Date;
  round?: number; // round result number to n number of decimal
  source?: 'default' | 'aggregated';
}

export abstract class DataStats {
  abstract aggregate: ITimeseriesAggregate;
  abstract getMainStats(options: IMainStatsOptions): Promise<StatsOutput>;
  abstract getTimeseriesStats(options: IMainStatsOptions): Promise<ITimeseriesStatsOutput>;
  abstract getAggregateModel(aggregate?: ITimeseriesAggregate): Model<any, any, any, any, any>;
}
/**
 * DataProcessor
 *
 * it takes list of sites data from database
 * and give functionality to process raw data into
 * user ready data
 */
export class DataProcessor {
  private data: ISitesData[];
  private _timeKey = 'sentAt';

  constructor(data: ISitesData[]) {
    this.data = data ?? [];
    // sanitize data
    if (data.length > 0 && !(this._timeKey in data[0])) {
      throw new BusinessRuleValidationError('Invalid data supplied');
    }
  }

  isBatteryModel(): boolean {
    if (this.data.length == 0) {
      return false;
    } else {
      return 'humidity' in this.data[0];
    }
  }
  isBatteryDataAggregate(): boolean {
    if (this.data.length == 0) {
      return false;
    } else {
      return 'avgHumidity' in this.data[0];
    }
  }

  isPanelData(): boolean {
    return false;
  }

  isInverterData(): boolean {
    if (this.data.length == 0) {
      return false;
    } else {
      return 'acVoltageIn' in this.data[0];
    }
  }

  isInverterDataAggregate(): boolean {
    if (this.data.length == 0) {
      return false;
    } else {
      return 'totalAcVoltageIn' in this.data[0];
    }
  }

  /**
   * get time difference in seconds
   * @param currentData
   * @param previousData
   * @returns
   */
  _getTimeDiff(currentData: ISitesData, previousData: ISitesData) {
    return (new Date(currentData[this._timeKey]) - new Date(previousData[this._timeKey])) / 1000;
  }

  addTimeDiffDf(df: dfd.DataFrame) {
    const time_diff = df[this._timeKey].map((ts, i) => {
      if (i === 0) return 0;
      return (ts - df[this._timeKey].values[i - 1]) / 1000;
      // return momentTime.diff(df[this._timeKey].values[i - 1], 'seconds');
    });
    return df.addColumn('time_diff', time_diff);
    // return df.withColumn(this._timeKey, df.get(this._timeKey).map((ts: string | Date) => moment(ts)));
  }

  excludeFields(data: any[], columns: string[]) {
    return data.map(data => {
      Object.keys(data).map(col => {
        if (!columns.includes(col)) {
          delete data[col];
        }
      });
    });
  }

  getDataframe(options?: BaseDataOptionType & { onlyColumns?: string[]; copy?: boolean }) {
    const src = options?.copy ? [...this.data] : this.data;
    const data = options?.onlyColumns ? this.excludeFields(src, options.onlyColumns) : src;
    return new dfd.DataFrame(this.data, options);
  }

  getTotalTimeSeconds() {
    if (this.data.length < 2) return 0;
    const startTime = new Date(this.data[0][this._timeKey]).getTime();
    const endTime = new Date(this.data[this.data.length - 1][this._timeKey]).getTime();
    return (endTime - startTime) / 1000; // Convert to seconds
  }

  /**
   * Adds total data based on the provided entity and column name.
   * @param entity The entity to calculate the total for.
   * @param columnName The name of the column to store the total data.
   * @returns The DataFrame with the added total data.
   */
  addTotalDataDf(entity: string, columnName: string) {
    let df = this.getDataframe({ onlyColumns: ['sentAt', entity] });
    if (!df.columns.includes(entity)) {
      throw new exception(`${entity} is not in data`);
    }
    // Sort by timestamp to ensure correct order
    df = df.sortValues(this._timeKey);
    df = this.addTimeDiffDf(df);
    const total = df[entity].mul(df['time_diff']);
    df = df.addColumn(columnName, total);
    return df;
  }

  getDataLength() {
    return this.data.length;
  }

  calculateTotal(entity: string, isCharged?: boolean) {
    let total_data = 0;

    for (let i = 0; i < this.data.length; i++) {
      const data = this.data[i]; // Get the current data entry
      let value = 0; // Initialize value to store the entity's value

      // Check if the entity's value is a number
      if (typeof data[entity] === 'number') {
        value = data[entity] ?? 0; // Assign the value or 0 if undefined

        // Check if the entity's value is an object with 'value' and 'unit' properties
      } else if (typeof data[entity] === 'object' && 'value' in data[entity] && 'unit' in data[entity]) {
        value = data[entity].value ?? 0;
        // unit conversion here if needed
      } else if (data[entity] !== undefined) {
        throw new Error(`Invalid data format for entity: ${entity}`);
      }

      // Apply isCharged filter
      if (isCharged === undefined || (isCharged && value > 0) || (!isCharged && value < 0)) {
        total_data += value; // Accumulate the total_data with the value
      }
    }

    return total_data; // Return the accumulated total_data
  }

  calculateTotalWithDeltaTime(entity: string, isCharged?: boolean) {
    let total_data = 0;

    for (let i = 1; i < this.data.length; i++) {
      const data = this.data[i]; // Get the current data entry
      // Calculate the time difference between the current and previous data entries
      const timeDiff = this._getTimeDiff(data, this.data[i - 1]);
      let value = 0; // Initialize value to store the entity's value

      // Check if the entity's value is a number
      if (typeof data[entity] === 'number') {
        value = data[entity] ?? 0; // Assign the value or 0 if undefined

        // Check if the entity's value is an object with 'value' and 'unit' properties
      } else if (typeof data[entity] === 'object' && 'value' in data[entity] && 'unit' in data[entity]) {
        value = data[entity].value ?? 0;
        // unit conversion here if needed
      } else if (data[entity] !== undefined) {
        throw new Error(`Invalid data format for entity: ${entity}`);
      }

      // Apply isCharged filter
      if (isCharged === undefined || (isCharged && value > 0) || (!isCharged && value < 0)) {
        total_data += value * timeDiff; // Accumulate the total_data with the value multiplied by the time difference
      }
    }

    return total_data; // Return the accumulated total_data
  }

  calculateSource(entity: string, isCharged?: boolean) {
    if (this.isInverterDataAggregate() || this.isBatteryDataAggregate()) {
      return this.calculateTotal(entity, isCharged);
    } else {
      return this.calculateTotalWithDeltaTime(entity, isCharged);
    }
  }

  calculateTotalEnergyWithDeltaTime(entity: string, isPositive: boolean) {
    let totalEnergy = 0;
    let previousTime = null;

    this.data.forEach(dataPoint => {
      const currentTime = dataPoint.timestamp;
      if (previousTime) {
        const timeDiff = (currentTime - previousTime) / 1000; // Convert to seconds
        const current = dataPoint[entity];
        const voltage = dataPoint['voltage'];
        if ((isPositive && current > 0) || (!isPositive && current < 0)) {
          totalEnergy += current * voltage * timeDiff;
        }
      }
      previousTime = currentTime;
    });

    return totalEnergy;
  }

  addTotalData(entity: string) {
    let total_data = 0;
    for (let i = 0; i < this.data.length; i++) {
      const data = this.data[i];

      let value = 0;
      if (typeof data[entity] === 'number') {
        value = data[entity] ?? 0;
      } else if (typeof data[entity] === 'object' && 'value' in data[entity] && 'unit' in data[entity]) {
        value = data[entity].value ?? 0;
        // Optionally, you can handle unit conversion here if needed
      } else if (data[entity] !== undefined) {
        throw new Error(`Invalid data format for entity: ${entity}`);
      }

      total_data += value;
    }
    return total_data;
  }

  /**
   * Calculates the total energy generated based on the power data.
   * @returns The total energy generated in kilowatt-hours.
   */
  getTotalEnergyGeneratedDf() {
    const df = this.addTotalDataDf('power', 'energy');
    const total_energy_watt_seconds = df['energy'].sum();
    return total_energy_watt_seconds / (1000 * 3600); // total_energy_kwh
  }

  /**
   * This method is 60 times faster than using df (0.15ms vs 6.1ms)
   * @returns
   */
  getTotalEnergyGenerated() {
    const total_energy_watt_seconds = this.calculateTotalWithDeltaTime('power');
    // Convert watt-seconds to kilowatt-hours
    return total_energy_watt_seconds / (1000 * 3600); // total_energy_kwh
  }
}

// testing
// const data = new DataProcessor([
//   {"sentAt": new Date("2023-10-01 00:00:00"), "power": 500, createdAt: new Date(), updatedAt: new Date(), id: 1},
//   {"sentAt": new Date("2023-10-01 00:00:03"), "power": 505, createdAt: new Date(), updatedAt: new Date(), id: 2},
//   {"sentAt": new Date("2023-10-01 00:00:05"), "power": 505, createdAt: new Date(), updatedAt: new Date(), id: 3},
//   {"sentAt": new Date("2023-10-01 00:00:10"), "power": 502, createdAt: new Date(), updatedAt: new Date(), id: 4},
// ])

// console.time('getTotalEnergyGenerated');
// console.log('total energy df', data.getTotalEnergyGeneratedDf());
// console.timeEnd('getTotalEnergyGenerated');

// console.time('getNormalTotalEnergyGenerated');
// console.log('total energy', data.getTotalEnergyGenerated());
// console.timeEnd('getNormalTotalEnergyGenerated');
