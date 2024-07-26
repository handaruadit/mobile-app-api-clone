import { isValidObjectId, Types } from "mongoose";

import { workspace as entity } from "@/models";
import { ErrorCodes } from "@/lib/enum";
import Exception from "@/lib/exception";
import resource from "@/middleware/resource-router-middleware";
import { getMainStats } from "@/lib/statistics";
import { IWorkspaceModelWithId as IWorkspaceEntity } from "@/models/workspace";
import { IDashboardOutput } from "@/interfaces/endpoints/dashboard";
import InverterStats from "@/batari/InverterDataProcessor";

export default () =>
  resource({
    list: async ({ account, params }, res) => {
      const { days = 1, hours = null } = params;
      const workspaces = await entity.find<IWorkspaceEntity>(
        {
          $or: [{ ownerId: account._id }, entity.memberFilter(account)],
        },
        undefined,
        undefined,
        undefined,
        { _owner: "", _members: "", _device: "_id batteryCapacity" },
        undefined,
        "plnPricePerKwh userAvgMonthlyExpenses name"
      );
      const workspaceIds = workspaces.map((workspace) => ({
        _id: workspace._id.toString(),
        name: workspace.name,
      }));

      const data = await Promise.all(
        workspaces.map(async (workspace) => {
          const deviceIds = workspace._device?._id
            ? [workspace._device?._id]
            : [];
          const stats = await getMainStats(deviceIds, 1, undefined);
          const monthlyStats = await getMainStats(deviceIds, 30, undefined);

          const totalCharged = stats[3]?.totalBatteryCharged ?? 0;

          const batteryDischarged = stats[3]?.totalBatteryDischarged ?? 0; // ijo
          const inverterOutput = stats[1][0]?.totalPowerOut ?? 0; // biru
          const panelOutput = stats[2][0]?.totalPower ?? 0;

          const total = batteryDischarged + inverterOutput + panelOutput;

          const calculatePercentage = (value: number) =>
            total > 0 ? (value / total) * 100 : 0;

          const consumption = stats[3]?.totalEnergyConsumed ?? 0;

          const totalPrice =
            (workspace.plnPricePerKwh ?? 0) *
            (monthlyStats[3]?.energyProduced ?? 0);
          const savings = Math.max(
            0,
            totalPrice - (workspace.userAvgMonthlyExpenses ?? 0)
          );

          return {
            workspaceId: workspace._id,
            name: workspace.name,
            savings,
            totalCharged,
            energyUsageSource: {
              batteryDischarged: calculatePercentage(batteryDischarged) ?? 0,
              inverterOutput: calculatePercentage(inverterOutput) ?? 0,
              panelOutput: calculatePercentage(panelOutput) ?? 0,
            },
            consumption,
            sectionPowerUsage: total,
          };
        })
      );

      const calcAvg = (key: keyof (typeof data)[0] | string) =>
        data.reduce((acc, value) => {
          const keys = key.split(".") as (keyof (typeof data)[0])[];
          let val: any = value;
          for (const k of keys) {
            val = val?.[k];
          }
          return acc + (val ?? 0);
        }, 0) / data.length;

      const deviceIds = workspaces.map((workspace) => {
        return workspace._device?._id ? [workspace._device?._id] : [];
      });
      const flattenedDeviceIds = deviceIds.flat();
      const inverterStats = new InverterStats(flattenedDeviceIds);
      const inverterMainStats = await inverterStats.getMainStats({
        days: Number(days),
        hours: Number(hours),
      });

      const response: IDashboardOutput = {
        workspaces: workspaceIds,
        ...inverterMainStats,
        totalCharged: calcAvg("totalCharged"),
        sectionPowerUsage: calcAvg("sectionPowerUsage"),
        energyUsageSource: {
          batteryDischarged: calcAvg("energyUsageSource.batteryDischarged"),
          inverterOutput: calcAvg("energyUsageSource.inverterOutput"),
          panelOutput: calcAvg("energyUsageSource.panelOutput"),
        },
        savings: {
          january: {
            total: calcAvg("savings"),
            weather: "sunny",
          },
        },
        greenstats: {
          carbonReduced: 0, // assume that we use coal only, calculate the lbs or kilogram saved
          coalSaved: 0, // same with carbonReduced but convert the CO2 to actual
          deforestationReduced: 0,
        },
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
          $or: [{ ownerId: account._id }, entity.memberFilter(account)],
        },
        undefined,
        undefined,
        undefined,
        { _owner: "", _members: "", _device: "_id batteryCapacity" },
        undefined,
        "plnPricePerKwh userAvgMonthlyExpenses"
      );

      if (workspaces.length === 0) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const workspace = workspaces[0];

      const userWorkspace = await entity.findWorkspacesOfUser(account._id);
      const workspaceIds = userWorkspace.map((workspace) => ({
        _id: workspace._id.toString(),
        name: workspace.name,
      }));

      const deviceIds = workspace._device?._id ? [workspace._device?._id] : [];

      const inverterStats = new InverterStats(deviceIds);
      const inverterMainStats = await inverterStats.getMainStats({
        days: Number(days),
        hours: Number(hours),
      });

      const stats = await getMainStats(deviceIds, 1, undefined);
      const monthlyStats = await getMainStats(deviceIds, 30, undefined);

      // const batteryDischarged = stats[3]?.totalBatteryDischarged ?? 0;
      // const inverterOutput = stats[1]?.[0]?.totalPowerOut ?? 0;
      // const panelOutput = stats[2]?.[0]?.totalPower ?? 0; // ??

      // const calculatePercentage = (value: number) =>
      //   total > 0 ? (value / total) * 100 : 0;

      const totalCharged = stats[3]?.totalBatteryCharged ?? 0;
      const totalPrice =
        (workspace.plnPricePerKwh ?? 0) *
        (monthlyStats[3]?.energyProduced ?? 0);
      const savings = Math.max(
        0,
        totalPrice - (workspace.userAvgMonthlyExpenses ?? 0)
      );

      const response: IDashboardOutput = {
        workspaces: workspaceIds,
        totalCharged: totalCharged, // form battery
        // monthly stats
        ...inverterMainStats,
        sectionPowerUsage: 0,
        savings: {
          // last 4 months
          january: {
            total: savings,
            weather: "sunny",
          },
        },
        // today data
        energyUsageSource: {
          batteryDischarged: 0, // from battery, current is positive
          inverterOutput: 0,
          panelOutput: 0, // from panel, current is positive
        },
        // today consumption
        greenstats: {
          carbonReduced: 0, // assume that we use coal only, calculate the lbs or kilogram saved
          coalSaved: 0, // same with carbonReduced but convert the CO2 to actual
          deforestationReduced: 0,
        },
      };

      res.json(response);
      return;
    },
  });
