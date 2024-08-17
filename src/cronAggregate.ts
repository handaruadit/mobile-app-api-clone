import cron from 'node-cron';
import { device as entity } from '@/models';
import BatteryStats from './batari/BatteryDataProcessor';
import PanelStats from './batari/PanelDataProcessor';
import InverterStats from './batari/InverterDataProcessor';

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

export function startCronJobs() {
  cron.schedule('* * * * *', async () => {
    console.log('Running minute aggregation...');
    try {
      await performMinuteAggregation();
      console.log('Minute aggregation completed successfully.');
    } catch (error) {
      console.error('Error during minute aggregation:', error);
    }
  });
  cron.schedule('0 * * * *', async () => {
    console.log('Running hour aggregation...');
    try {
      await performHourlyAggregation();
      console.log('Hour aggregation completed successfully.');
    } catch (error) {
      console.error('Error during hour aggregation:', error);
    }
  });
}
