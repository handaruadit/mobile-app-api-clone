import resource from '@/middleware/resource-router-middleware';
import BatteryTelemetryAgg from '@/models/batteryDataAggregated';
import { BatteryDerivedMetrics } from '@/batari/BatteryDataProcessorV2';
import { BatteryTelemetryAgg as IBatteryTelemetryAgg } from '@/types/batteryData';
import { workspace } from '@/models';
import { IWorkspaceModelWithId } from '@/models/workspace';

/**
 * GET /api/protected/battery?siteId&batteryId&windowSize&days
 * Returns derived and raw statistics for a battery by site/batteryId and interval
 */
export default () =>
  resource({
    list: async ({ params, query }, res) => {
      try {
        // Accept params from either query or search/filter post
        // E.g. siteId, batteryId, windowSize, days
        const {
          siteId,
          batteryId,
          windowSize = '1m',
          days = 1
        }: {
          siteId?: string;
          batteryId?: string;
          windowSize?: string;
          days?: number;
        } = { ...params, ...query };

        if (!siteId && !batteryId) {
          return res.status(400).json({ error: 'siteId or batteryId are required' });
        }

        // Look up battery specs from device model (simplified for now)
        // const device = await deviceModel.model
        //   .findOne({
        //     siteId,
        //     _id: batteryId
        //   })
        //   .lean();

        // if (!device) {
        //   return res.status(404).json({ error: 'Battery device not found' });
        // }
        // hardcoded device for now
        const device = {
          name: 'B012026',
          batteryCapacity: 2560, // in Wh, e.g., a typical Li-ion battery 48V 53Ah
          maxBatteryTemp: 55, // realistic maximum battery temp (°C)
          maxBatteryCycles: 3000 // modern LiFePO4 cycle life (can range 2000–6000)
        };

        // Fallback for key specs
        const nominalCapacityWh = device.batteryCapacity ?? 1000;

        // Find battery aggregation windows within last X days
        const sinceDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

        const aggs: IBatteryTelemetryAgg[] = await BatteryTelemetryAgg.find({
          siteId,
          batteryId: 'B012026', // change this
          windowSize,
          windowStart: { $gte: sinceDate }
        })
          .sort({ windowStart: 1 })
          .lean();

        // Attach derived metrics
        const spec = {
          nominalCapacityWh,
          maxTempC: device.maxBatteryTemp ?? undefined,
          maxCycles: device.maxBatteryCycles ?? undefined
        };

        const results = aggs.map(agg => {
          if (agg.batteryId) {
            device.name = agg.batteryId;
          }
          const derived = BatteryDerivedMetrics.process(agg, spec);
          return {
            ...agg,
            derived
          };
        });

        const site = await workspace.get<IWorkspaceModelWithId>(siteId as string);

        return res.json({
          battery: {
            name: device.name,
            siteId: site?.name ?? 'Kantor',
            spec
          },
          windows: results
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[BatteryAPI] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  });
