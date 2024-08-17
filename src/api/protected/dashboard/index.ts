import { isValidObjectId, Types } from 'mongoose';

import { workspace as entity } from '@/models';
import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { calcAvgFromData, getMainStats } from '@/lib/statistics';
import { IWorkspaceModelWithId as IWorkspaceEntity } from '@/models/workspace';
import { IDashboardOutput, MonthlySavingsType } from '@/interfaces/endpoints/dashboard';
import InverterStats from '@/batari/InverterDataProcessor';
import BatteryStats from '@/batari/BatteryDataProcessor';
import PanelStats from '@/batari/PanelDataProcessor';
import greenEnergyCalculator from '@/batari/GreenEnergyCalculator';
import { getLastThreeMonths } from '@/lib/date';
import { getDashboardDataPerWorkspace } from '@/batari/entities/dashboard';

export default () =>
  resource({
    list: async ({ account, params }, res) => {
      const { days = 1, hours = null } = params;
      // const random = Math.random();
      const workspaces = await entity.find<IWorkspaceEntity>(
        {
          $or: [{ ownerId: account._id }, entity.memberFilter(account)]
        },
        undefined,
        undefined,
        undefined,
        { _owner: '', _members: '', _device: '_id batteryCapacity' },
        undefined,
        'plnPricePerKwh userAvgMonthlyExpenses name'
      );
      const workspaceIds = workspaces.map(workspace => ({
        _id: workspace._id.toString(),
        name: workspace.name
      }));

      /**
       * On why we query the database per workspaces:
       * 1. may need data per workspace in the future
       * 2. need data per workspaces such as plnPricePerKwh and userAvgMonthlyExpenses
       * 2. less RAM usage in database side. At the moment we use mongo cloud so less RAM vs query time tradeoff we choose less RAM for now.
       */
      const lastThreeMonths = getLastThreeMonths();
      const data: IDashboardOutput[] = await getDashboardDataPerWorkspace(workspaces);

      const deviceIds = workspaces.map(workspace => {
        return workspace._device?._id ? [workspace._device?._id] : [];
      });
      const flattenedDeviceIds = deviceIds.flat();
      const inverterStats = new InverterStats(flattenedDeviceIds);
      const inverterMainStats = await inverterStats.getMainStats({
        days: Number(days),
        hours: Number(hours),
        source: 'aggregated'
      });
      const savings: MonthlySavingsType = {};
      lastThreeMonths.map(month => {
        savings[month] = {
          total: Number(calcAvgFromData(data, `savings.${month}.total`).toFixed(2)),
          weather: 'sunny'
        };
      });
      const response: IDashboardOutput = {
        workspaces: workspaceIds,
        ...inverterMainStats,
        totalCharged: calcAvgFromData(data, 'totalCharged'),
        sectionPowerUsage: calcAvgFromData(data, 'sectionPowerUsage'),
        energyUsageSource: {
          batteryDischarged: calcAvgFromData(data, 'energyUsageSource.batteryDischarged'),
          inverterOutput: calcAvgFromData(data, 'energyUsageSource.inverterOutput'),
          panelOutput: calcAvgFromData(data, 'energyUsageSource.panelOutput')
        },
        savings,
        greenstats: {
          ...greenEnergyCalculator(calcAvgFromData(data, 'energyGenerated'))
        },
        workspaceData: data
      };

      res.json(response);
      return;
    },

    read: async ({ account, params }, res) => {
      const { id, days = 1, hours = null } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const workspaces = await entity.find<IWorkspaceEntity>(
        {
          _id: new Types.ObjectId(id),
          $or: [{ ownerId: account._id }, entity.memberFilter(account)]
        },
        undefined,
        undefined,
        undefined,
        { _owner: '', _members: '', _device: '_id batteryCapacity' },
        undefined,
        'plnPricePerKwh userAvgMonthlyExpenses name'
      );

      if (workspaces.length === 0) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const workspace = workspaces[0];

      const userWorkspace = await entity.findWorkspacesOfUser(account._id);
      const workspaceIds = userWorkspace.map(workspace => ({
        _id: workspace._id.toString(),
        name: workspace.name
      }));

      const deviceIds = workspace._device?._id ? [workspace._device?._id] : [];

      const [inverterMainStats, batteryMainStats, panelMainStats] = await Promise.all([
        new InverterStats(deviceIds).getMainStats({
          days: Number(days),
          hours: Number(hours)
        }),
        new BatteryStats(deviceIds).getMainStats({
          days: Number(days),
          hours: Number(hours)
        }),
        new PanelStats(deviceIds).getMainStats({
          days: Number(days),
          hours: Number(hours)
        })
      ]);

      const monthlyStats = await getMainStats({ deviceIds, daysAgoStart: 30 });
      const total = (batteryMainStats.totalDischarged ?? 0) + (inverterMainStats.totalPowerOut ?? 0) + (panelMainStats.totalEnergyGenerated ?? 0);
      const calculatePercentage = (value: number) => (total > 0 ? (value / total) * 100 : 0);

      const totalPrice = (workspace.plnPricePerKwh ?? 0) * (monthlyStats[3]?.energyProduced ?? 0);
      const savings = Math.max(0, totalPrice - (workspace.userAvgMonthlyExpenses ?? 0));

      const response: IDashboardOutput = {
        workspaces: workspaceIds,
        totalCharged: batteryMainStats.totalCharged, // form battery
        // monthly stats
        ...inverterMainStats,
        sectionPowerUsage: 0,
        savings: {
          // last 4 months
          january: {
            total: savings,
            weather: 'sunny'
          }
        },
        // today data
        energyUsageSource: {
          batteryDischarged: calculatePercentage(batteryMainStats.totalDischarged ?? 0), // from battery, current is positive
          inverterOutput: calculatePercentage(inverterMainStats.totalPowerOut ?? 0),
          panelOutput: calculatePercentage(panelMainStats.totalEnergyGenerated ?? 0) // from panel, current is positive
        },
        // today consumption
        greenstats: {
          ...greenEnergyCalculator(panelMainStats.totalEnergyGenerated || 0)
        }
      };

      res.json(response);
      return;
    }
  });
