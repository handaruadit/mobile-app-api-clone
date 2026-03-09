export interface MetricStat {
  avg?: number;
  min?: number;
  max?: number;
  last?: number;
}

export interface BatteryTelemetryAgg {
  siteId: string;
  batteryId: string;
  windowStart: Date;
  windowSize: '1m' | '5m' | '15m' | '1h';

  metrics: {
    V_Total?: MetricStat;
    Arus?: MetricStat;
    SOC?: MetricStat;
    Suhu_Power_Tube?: MetricStat;
    Suhu_Balancing_Board?: MetricStat;
    Suhu_Baterai?: MetricStat;

    Energy_Wh?: number;
  };
}

export interface DerivedBatteryMetrics {
  powerW?: number;
  energyWh?: number;

  remainingEnergyWh?: number;

  cellImbalanceV?: number;
  thermalIndex?: number;

  healthScore?: number;
  healthLabel?: 'excellent' | 'good' | 'warning' | 'critical';
}
