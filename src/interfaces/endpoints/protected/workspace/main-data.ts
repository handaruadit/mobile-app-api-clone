// import { IProtectedInverterData } from "@/types";

import { IBatteryDataModelOutput } from "@/models/batteryData";
import { IInverterDataModelOutput } from "@/models/inverterData";
import { IPanelDataModelOutput } from "@/models/panelData";

export interface OutputMainInverterData {
  _id: null;
  totalPowerIn: number;
  totalPowerOut: number;
  totalConsumption: number;
  totalAcVoltageIn: number;
  totalAcVoltageOut: number;
  totalAcCurrenctIn: number;
  totalAcCurrentOut: number;
  avgPowerIn: number;
  avgPowerOut: number;
  avgConsumption: number;
  avgAcVoltageIn: number;
  avgAcVoltageOut: number;
  avgAcCurrenctIn: number;
  avgAcCurrentOut: number;
}

export interface OutputMainBatteryData {
  _id: null;
  totalPower: number;
  totalVoltage: number;
  totalCurrent: number;
  avgVoltage: number;
  avgCurrent: number;
  avgPower: number;
  avgHumidity: number;
  avgHeatIndex: number;
  avgTemperature: number;
}

export interface OutputMainPanelData {
  _id: null;
  totalPower: number;
  totalVoltage: number;
  totalCurrent: number;
  avgVoltage: number;
  avgCurrent: number;
  avgPower: number;
  avgLux: number;
  avgTemperature: number;
}

export type OutputProtectedData = {
  panelData: OutputMainPanelData;
  batteryData: OutputMainBatteryData;
  inverterData: OutputMainInverterData;
  calculatedData: SolarPanelDataOutput;
}

export type SolarPanelDataOutput = {
  energyProduced: number;
  totalBatteryCharged: number;
  totalEnergyConsumed: number;
  totalBatteryDischarged: number;
  totalSurplusEnergy: number;
};

// export type OutputProtectedTimeseriesData = IProtectedInverterData[];
export type OutputProtectedTimeseriesData = {
  panelData: IPanelDataModelOutput;
  batteryData: IBatteryDataModelOutput;
  inverterData: IInverterDataModelOutput;
};
