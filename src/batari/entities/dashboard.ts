import { DeviceComponentType } from '@/lib/enum';
import { calcSavings, getMainStats } from '@/lib/statistics';
import { getLastThreeMonths } from '@/lib/date';
import { IWorkspaceModelWithId as IWorkspaceEntity } from '@/models/workspace';

export const getDashboardDataPerWorkspace = async (workspaces: IWorkspaceEntity[]) => {
  const lastThreeMonths = getLastThreeMonths();
  return await Promise.all(
    workspaces.map(async workspace => {
      const deviceIds = workspace._device?._id ? [workspace._device?._id] : [];
      const [stats, monthlyStats, stats2MonthAgo, stats3MonthAgo] = await Promise.all([
        getMainStats({ deviceIds, daysAgoStart: 1 }),
        getMainStats({ deviceIds, daysAgoStart: 30, componentIncluded: [DeviceComponentType.PANEL] }),
        getMainStats({ deviceIds, daysAgoStart: 60, daysAgoEnd: 30, componentIncluded: [DeviceComponentType.PANEL] }),
        getMainStats({ deviceIds, daysAgoStart: 90, daysAgoEnd: 60, componentIncluded: [DeviceComponentType.PANEL] })
      ]);
      const totalCharged = stats[3]?.totalBatteryCharged ?? 0;

      const batteryDischarged = stats[3]?.totalBatteryDischarged ?? 0; // ijo
      const inverterOutput = stats[1][0]?.totalPowerOut ?? 0; // biru
      const panelOutput = stats[2][0]?.totalPower ?? 0;

      const total = batteryDischarged + inverterOutput + panelOutput;

      const calculatePercentage = (value: number) => (total > 0 ? (value / total) * 100 : 0);

      const consumption = stats[3]?.totalEnergyConsumed ?? 0;
      const savings = calcSavings(monthlyStats[3]?.energyProduced ?? 0, workspace.plnPricePerKwh, workspace.userAvgMonthlyExpenses);
      const savings2 = calcSavings(stats2MonthAgo[3]?.energyProduced ?? 0, workspace.plnPricePerKwh, workspace.userAvgMonthlyExpenses);
      const savings3 = calcSavings(stats3MonthAgo[3]?.energyProduced ?? 0, workspace.plnPricePerKwh, workspace.userAvgMonthlyExpenses);

      return {
        workspaceId: workspace._id.toString(),
        name: workspace.name,
        savings: {
          [lastThreeMonths[0]]: { total: savings3 },
          [lastThreeMonths[1]]: { total: savings2 },
          [lastThreeMonths[2]]: { total: savings }
        },
        totalCharged,
        energyUsageSource: {
          batteryDischarged: calculatePercentage(batteryDischarged) ?? 0,
          inverterOutput: calculatePercentage(inverterOutput) ?? 0,
          panelOutput: calculatePercentage(panelOutput) ?? 0
        },
        consumption,
        sectionPowerUsage: total,
        energyGenerated: panelOutput
      };
    })
  );
};
