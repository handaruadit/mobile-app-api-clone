export type OutputTimeseriesBatteryData = {
  time: string | Date;
  charged?: number;
  discharged?: number;
};

export type OutputTimeseriesInverterData = {
  time: string | Date;
  powerUsage?: number; // acPowerOut
  chargedFromGrid?: number; // charging from grid. Only in hybrid inverter or bi-directional inverter type
};

export type OutputTimeseriesPanelData = {
  time: string | Date;
  powerGenerated?: number;
};

export type ITimeseriesStatsOutput = (OutputTimeseriesBatteryData & OutputTimeseriesInverterData & OutputTimeseriesPanelData)[];
