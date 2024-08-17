export interface OutputTnstatisticsRead {
  panel?: {
    panel_solar_produced?: number;
    lux?: number;
    temperature?: number;
  };
  battery?: {
    charged?: number;
    temperature?: number;
    humidity?: number;
  };
  power?: {
    generated_from_grid?: number;
    generated_from_pv?: number;
    total_consumed?: number;
  };
  go_green?: {
    carbonReduced?: number;
    coalSaved?: number;
    deforestationReduced?: number;
  };
}
