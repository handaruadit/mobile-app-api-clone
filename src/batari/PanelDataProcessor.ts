import { DataProcessor, DataStats, IMainStatsOptions } from "./DataProcessor";
import { panelData } from "@/models";
import { IPanelDataModelWithId } from "@/models/panelData";
import { Types } from "mongoose";
import { OutputMainPanelData, StatsOutput } from "@/types";
import moment from "moment";

export default class PanelStats implements DataStats {
  private _timezone = "Asia/Jakarta";
  deviceIds: (string | Types.ObjectId)[];
  dataProcessor: DataProcessor;

  constructor(deviceIds: (string | Types.ObjectId)[]) {
    this.deviceIds = deviceIds;
  }

  // Power related methods
  getPower(dataProcessor: DataProcessor) {
    const totalEnergy = dataProcessor.calculateTotalWithDeltaTime("power");
    return totalEnergy;
  }

  getAvgPower(dataProcessor: DataProcessor) {
    const totalEnergy = this.getPower(dataProcessor);
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalEnergy / totalTimeSeconds; // Returns average power in watts
  }

  // Current related methods
  getCurrent(dataProcessor: DataProcessor) {
    const totalCurrentCoulombs =
      dataProcessor.calculateTotalWithDeltaTime("current");
    const totalTimeSeconds = 3600; // Assuming the data is for one hour
    return totalCurrentCoulombs / totalTimeSeconds; // Returns current in ampere hour
  }

  getAvgCurrent(dataProcessor: DataProcessor) {
    const totalCurrent = dataProcessor.calculateTotalWithDeltaTime("current");
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalCurrent / totalTimeSeconds; // Returns average current in amperes
  }

  // Voltage related methods
  getVoltage(dataProcessor: DataProcessor) {
    const volt = dataProcessor.addTotalData("voltage");
    return volt;
  }

  getAvgVoltage(dataProcessor: DataProcessor) {
    const totalVoltage = dataProcessor.addTotalData("voltage");
    const dataPointsCount = dataProcessor.getDataLength();
    return totalVoltage / dataPointsCount; // Returns average voltage in volts
  }

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
    const data = await panelData.find<IPanelDataModelWithId>({
      createdAt: hours ? hoursFilter : daysFilter,
      deviceId: { $in: this.deviceIds },
    });
    this.dataProcessor = new DataProcessor(data);
    return this.dataProcessor;
  }

  async getMainStats(options: IMainStatsOptions): Promise<OutputMainPanelData> {
    const dataProcessor = this.dataProcessor
      ? this.dataProcessor
      : await this.getDataProcessor(options);

    if (!dataProcessor) {
      throw Error("Failed to get Data Processor");
    }

    return {
      totalEnergyGenerated: this.getPower(dataProcessor),
      totalCurrent: this.getCurrent(dataProcessor),
      totalVoltage: this.getVoltage(dataProcessor),
      avgCurrent: this.getAvgCurrent(dataProcessor),
      avgPower: this.getAvgPower(dataProcessor),
      avgVoltage: this.getAvgVoltage(dataProcessor),
    };
  }

  /** not implemented */
  async getTimeseriesStats(): Promise<StatsOutput> {
    // @ts-ignore
    return undefined;
  }
}
