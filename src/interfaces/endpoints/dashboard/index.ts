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
  savings?: { 
    [key: string]: {
      total?: number;
      weather?: string;
    };
  };
  batteryDischarged?: number;
  panelOutput?: number;
  greenstats?: {
    carbonReduced?: number;
    coalSaved?: number;
    deforestationReduced?: number;
  };
}
