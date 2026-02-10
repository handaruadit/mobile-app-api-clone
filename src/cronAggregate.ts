import cron from 'node-cron';
import { device as entity } from '@/models';
import BatteryStats from './batari/BatteryDataProcessor';
import PanelStats from './batari/PanelDataProcessor';
import InverterStats from './batari/InverterDataProcessor';
import { performBatteryAggregation } from './jobs/batteryAgg.job';

export async function performMinuteAggregation() {
  try {
    const devices = await entity.model.find().populate('inverters').populate('panels').populate('batteries');

    const batteryIds = devices.map(device => device.batteries.map((battery: any) => battery._id));
    const batteryEntity = new BatteryStats(batteryIds.flat());

    const panelIds = devices.map(device => device.panels.map((panel: any) => panel._id));
    const panelEntity = new PanelStats(panelIds.flat());

    const inverterIds = devices.map(device => device.inverters.map((inverter: any) => inverter._id));
    const inverterEntity = new InverterStats(inverterIds.flat());

    await Promise.all([inverterEntity.aggregateMinuteData(), panelEntity.aggregateMinuteData(), batteryEntity.aggregateMinuteData()]);

    return;
  } catch (error) {
    console.error('Error during database query:', error);
    throw error;
  }
}

export async function performHourlyAggregation() {
  try {
    const devices = await entity.model.find().populate('inverters').populate('panels').populate('batteries');

    const batteryIds = devices.map(device => device.batteries.map((battery: any) => battery._id));
    const batteryEntity = new BatteryStats(batteryIds.flat());

    const panelIds = devices.map(device => device.panels.map((panel: any) => panel._id));
    const panelEntity = new PanelStats(panelIds.flat());

    const inverterIds = devices.map(device => device.inverters.map((inverter: any) => inverter._id));
    const inverterEntity = new InverterStats(inverterIds.flat());

    await Promise.all([inverterEntity.aggregateHourlyData(), panelEntity.aggregateHourlyData(), batteryEntity.aggregateHourlyData()]);

    return;
  } catch (error) {
    console.error('Error during database query:', error);
    throw error;
  }
}

export async function performDailyAggregation() {
  try {
    const devices = await entity.model.find().populate('inverters').populate('panels').populate('batteries');

    const batteryIds = devices.map(device => device.batteries.map((battery: any) => battery._id));
    const batteryEntity = new BatteryStats(batteryIds.flat());

    const panelIds = devices.map(device => device.panels.map((panel: any) => panel._id));
    const panelEntity = new PanelStats(panelIds.flat());

    const inverterIds = devices.map(device => device.inverters.map((inverter: any) => inverter._id));
    const inverterEntity = new InverterStats(inverterIds.flat());

    await Promise.all([inverterEntity.aggregateDailyData(), panelEntity.aggregateDailyData(), batteryEntity.aggregateDailyData()]);

    return;
  } catch (error) {
    console.error('Error during database query:', error);
    throw error;
  }
}

export async function performWeeklyAggregation() {
  try {
    const devices = await entity.model.find().populate('inverters').populate('panels').populate('batteries');

    const batteryIds = devices.map(device => device.batteries.map((battery: any) => battery._id));
    const batteryEntity = new BatteryStats(batteryIds.flat());

    const panelIds = devices.map(device => device.panels.map((panel: any) => panel._id));
    const panelEntity = new PanelStats(panelIds.flat());

    const inverterIds = devices.map(device => device.inverters.map((inverter: any) => inverter._id));
    const inverterEntity = new InverterStats(inverterIds.flat());

    await Promise.all([inverterEntity.aggregateWeeklyData(), panelEntity.aggregateWeeklyData(), batteryEntity.aggregateWeeklyData()]);

    return;
  } catch (error) {
    console.error('Error during database query:', error);
    throw error;
  }
}

export function startCronJobs() {
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running battery aggregation...');
    try {
      await performBatteryAggregation();
      console.log('Battery aggregation completed successfully.');
    } catch (error) {
      console.error('Error during battery aggregation:', error);
    }

    const nextRun = new Date();
    nextRun.setMinutes(nextRun.getMinutes() + 5);
    console.log('Next run:', nextRun);
  });

  // cron.schedule('* * * * *', async () => {
  //   console.log('Running minute aggregation...');
  //   try {
  //     await performMinuteAggregation();
  //     console.log('Minute aggregation completed successfully.');
  //   } catch (error) {
  //     console.error('Error during minute aggregation:', error);
  //   }
  // });
  // cron.schedule('0 * * * *', async () => {
  //   console.log('Running hour aggregation...');
  //   try {
  //     await performHourlyAggregation();
  //     console.log('Hour aggregation completed successfully.');
  //   } catch (error) {
  //     console.error('Error during hour aggregation:', error);
  //   }
  // });
  // cron.schedule('0 0 * * *', async () => {
  //   console.log('Running daily aggregation...');
  //   try {
  //     await performDailyAggregation();
  //     console.log('Daily aggregation completed successfully.');
  //   } catch (error) {
  //     console.error('Error during daily aggregation:', error);
  //   }
  // });

  // cron.schedule('0 0 * * 0', async () => {
  //   console.log('Running weekly aggregation...');
  //   try {
  //     await performWeeklyAggregation();
  //     console.log('Weekly aggregation completed successfully.');
  //   } catch (error) {
  //     console.error('Error during weekly aggregation:', error);
  //   }
  // });
}
