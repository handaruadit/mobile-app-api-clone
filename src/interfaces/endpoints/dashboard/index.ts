export interface MonthlySavingsType {
  [x: string]: {
    total?: number;
    weather?: string;
  };
}

export interface IDashboardOutput {
  workspaces?: {
    _id: string;
    name: string;
  }[];
  consumption?: number;
  energyFromGrid?: number;
  totalCharged?: number;
  sectionPowerUsage?: number;
  energyUsageSource?: {
    batteryDischarged?: number;
    inverterOutput?: number;
    panelOutput?: number;
  };
  workspaceId?: string;
  name?: string;
  savings?: MonthlySavingsType;
  batteryDischarged?: number;
  panelOutput?: number;
  greenstats?: {
    carbonReduced?: number;
    coalSaved?: number;
    deforestationReduced?: number;
  };
  workspaceData?: IDashboardOutput[];
}
