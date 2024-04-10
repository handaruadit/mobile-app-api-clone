import { IProtectedInverterData } from "@/types";

export interface OutputProtectedData {
  totalYield: number;
  todayConsumption: number;
  totalCharging: number;
  totalPowerUsage: number;
}


export type OutputProtectedTimeseriesData = IProtectedInverterData[];
