import moment from "moment";
import { DataProcessor, DataStats, IMainStatsOptions } from "./DataProcessor";
import { inverterData } from "@/models";
import { IInverterDataModelWithId } from "@/models/inverterData";
import { Types } from "mongoose";
import { StatsOutput } from "@/types";

export default class InverterStats implements DataStats {
  private _timezone = "Asia/Jakarta";
  deviceIds: (string | Types.ObjectId)[];
  dataProcessor: DataProcessor;

  constructor(deviceIds: (string | Types.ObjectId)[]) {
    this.deviceIds = deviceIds;
  }

  getConsumption(dataProcessor: DataProcessor) {
    const totalEnergyWattSeconds =
      dataProcessor.calculateTotalWithDeltaTime("acPowerOut");
    // Convert watt-seconds to kilowatt-hours
    return totalEnergyWattSeconds / (1000 * 3600); // total_energy_kwh
  }

  getEnergyFromGrid(dataProcessor: DataProcessor) {
    const totalEnergyWattSeconds =
      dataProcessor.calculateTotalWithDeltaTime("acPowerIn");
    // Convert watt-seconds to kilowatt-hours
    return totalEnergyWattSeconds / (1000 * 3600); // total_energy_kwh
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
    const data = await inverterData.find<IInverterDataModelWithId>({
      createdAt: hours ? hoursFilter : daysFilter,
      deviceId: { $in: this.deviceIds },
    });
    this.dataProcessor = new DataProcessor(data);
    return this.dataProcessor;
  }

  async getMainStats(options: IMainStatsOptions): Promise<StatsOutput> {
    const dataProcessor = this.dataProcessor
      ? this.dataProcessor
      : await this.getDataProcessor(options);

    if (!dataProcessor) {
      throw Error("Failed to get Data Processor");
    }

    return {
      consumption: this.getConsumption(dataProcessor),
      energyFromGrid: this.getEnergyFromGrid(dataProcessor),
    };
  }

  /** not implemented */
  async getTimeseriesStats(): Promise<StatsOutput> {
    // @ts-ignore
    return undefined;
  }
}
