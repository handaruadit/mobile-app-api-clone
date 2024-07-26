import { DataProcessor, DataStats, IMainStatsOptions } from "./DataProcessor";
import { batteryData } from "@/models";
import { IBatteryDataModelWithId } from "@/models/batteryData";
import { Types } from "mongoose";
import { OutputMainBatteryData, StatsOutput } from "@/types";
import moment from "moment";

export default class BatteryStats implements DataStats {
  private _timezone = "Asia/Jakarta";
  deviceIds: (string | Types.ObjectId)[];
  dataProcessor: DataProcessor;

  constructor(deviceIds: (string | Types.ObjectId)[]) {
    this.deviceIds = deviceIds;
  }

  // Current related methods
  getCurrent(dataProcessor: DataProcessor) {
    const totalCurrentCoulombs =
      dataProcessor.calculateTotalWithDeltaTime("current");
    const totalTimeSeconds = 3600; // Assuming the data is for one hour
    return totalCurrentCoulombs / totalTimeSeconds; // Returns current in amperes
  }

  getAvgCurrent(dataProcessor: DataProcessor) {
    const totalCurrent = dataProcessor.calculateTotalWithDeltaTime("current");
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalCurrent / totalTimeSeconds; // Returns average current in amperes
  }

  getTotalChargeCapacity(dataProcessor: DataProcessor) {
    return dataProcessor.calculateTotalWithDeltaTime("current", true);
  }

  getTotalCharged(dataProcessor: DataProcessor) {
    const current = dataProcessor.calculateTotalWithDeltaTime("current", true);
    const voltage = this.getVoltage(dataProcessor);
    return current * voltage;
  }

  getTotalDischarged(dataProcessor: DataProcessor) {
    const current = dataProcessor.calculateTotalWithDeltaTime("current", false);
    const voltage = this.getVoltage(dataProcessor);
    return current * voltage;
  }

  // Voltage related methods
  getVoltage(dataProcessor: DataProcessor) {
    const volt = dataProcessor.addTotalData("voltage");
    return volt;
  }

  getAvgVoltage(dataProcessor: DataProcessor) {
    const totalVoltage = dataProcessor.calculateTotalWithDeltaTime("voltage");
    const dataPointsCount = dataProcessor.getDataLength();
    return totalVoltage / dataPointsCount; // Returns average voltage in volts
  }

  // Power related methods
  getPower(dataProcessor: DataProcessor) {
    const voltage = this.getVoltage(dataProcessor);
    const current = this.getCurrent(dataProcessor); // Use current in ampere-hours
    return (voltage * current) / 1000; // Convert to kilowatt-hours
  }

  getAvgPower(dataProcessor: DataProcessor) {
    const totalEnergy = this.getTotalEnergyCapacity(dataProcessor);
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalEnergy / totalTimeSeconds; // Returns average power in watts
  }

  // Energy related methods
  getTotalEnergyCapacity(dataProcessor: DataProcessor) {
    return dataProcessor.calculateTotalEnergyWithDeltaTime("current", true);
  }

  // Data processing methods
  async getDataProcessor({ timezone, days, hours }: IMainStatsOptions) {
    timezone = timezone ?? this._timezone;
    const todayStart = moment()
      .tz(timezone)
      .subtract(days, "days")
      .startOf("day");
    const daysFilter = { $gte: todayStart.toDate() };
    const hoursFilter = hours
      ? { $gte: moment().tz(timezone).subtract(hours, "hours").toDate() }
      : undefined;
    const data = await batteryData.find<IBatteryDataModelWithId>({
      createdAt: hours ? hoursFilter : daysFilter,
      deviceId: { $in: this.deviceIds },
    });
    this.dataProcessor = new DataProcessor(data);

    return this.dataProcessor;
  }

  async getMainStats(
    options: IMainStatsOptions
  ): Promise<OutputMainBatteryData> {
    const dataProcessor = this.dataProcessor
      ? this.dataProcessor
      : await this.getDataProcessor(options);

    if (!dataProcessor) {
      throw Error("Failed to get Data Processor");
    }

    return {
      totalPower: this.getPower(dataProcessor),
      totalCurrent: this.getCurrent(dataProcessor),
      totalVoltage: this.getVoltage(dataProcessor),
      totalCharged: this.getTotalCharged(dataProcessor),
      totalDischarged: this.getTotalDischarged(dataProcessor),
      totalChargedCapacity: this.getTotalChargeCapacity(dataProcessor),
      totalEnergyCapacity: this.getTotalEnergyCapacity(dataProcessor),
      avgPower: this.getAvgPower(dataProcessor),
      avgCurrent: this.getAvgCurrent(dataProcessor),
      avgVoltage: this.getAvgVoltage(dataProcessor),
    };
  }

  /** not implemented */
  async getTimeseriesStats(): Promise<StatsOutput> {
    // @ts-ignore
    return undefined;
  }
}
