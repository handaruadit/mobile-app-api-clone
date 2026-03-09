import fs from 'fs';
import { batteryData, inverterData, panelData, workspace } from '@/models';
import MQTT from './mqtt';
import { IWorkspaceModelWithId } from '@/models/workspace';

type DeviceType = 'batteries' | 'inverters-ac-input' | 'inverters-ac-output' | 'pv-modules';

class Messenger {
  private static instance: Messenger;
  mqtt: MQTT;

  constructor(mqtt: MQTT) {
    if (!Messenger.instance) {
      this.mqtt = mqtt;
      Messenger.instance = this;
    }

    return Messenger.instance;
  }

  processContents = () => {
    this.mqtt.client.on('message', (topic, _, message) => {
      console.log(`Received message on topic ${topic}`);
      // Handle all batteries MQTT topics (from addBatterySubscriber)
      if (this._isBatteryTopic(topic)) {
        this.handleBatteryTopic(topic, message);
        return;
      }
      // Normal process for other topics
      const { siteId, type, deviceId } = this._getTopicInformation(topic);
      const payloadString = message.payload;
      const fileName = `data_test/${siteId}/${type}-${deviceId}${new Date().toDateString()}.json`;
      const dir = `data_test/${siteId}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fileName, payloadString); // might be temporary for monitoring
      console.log(`payload ${String(payloadString)}`);

      if (payloadString) {
        this.processMessage(topic, siteId, type, deviceId, String(payloadString))
          .then(() => {
            console.log('data has been processed!');
          })
          .catch(error => {
            console.error('Failed to acknowledge');
            console.log(error);
          });
        return;
      }
    });
  };

  // Helper to check if topic matches battery custom topics
  _isBatteryTopic = (topic: string): boolean => {
    // e.g. batari-energy or direct <site>/<battery> from addBatterySubscriber
    // Handle topics like "sitename/batteryid", "sitename/batteryid/<extra>"
    const batteryTopicPattern = /^.+\/.+(\/(V_Total|Arus|SOC|Suhu_Power_Tube|Suhu_Balancing_Board|Suhu_Baterai|Jumlah_Siklus|Baterai\/Tegangan_Sel))?$/;
    // Avoid conflicting with batari-energy topics
    if (topic.startsWith('batari-energy/')) {
      return false;
    }
    return batteryTopicPattern.test(topic);
  };

  handleBatteryTopic = async (topic: string, message: any) => {
    try {
      // Example topics:
      // "<site>/<battery>"
      // "<site>/<battery>/V_Total"
      // "<site>/<battery>/Arus"
      // "<site>/<battery>/SOC"
      // "<site>/<battery>/Suhu_Power_Tube"
      // "<site>/<battery>/Suhu_Balancing_Board"
      // "<site>/<battery>/Suhu_Baterai"
      // "<site>/<battery>/Jumlah_Siklus"
      // "<site>/<battery>/Baterai/Tegangan_Sel"
      const topicParts = topic.split('/');
      const siteName = topicParts[0];
      const batteryId = topicParts[1];
      const dataPoint = topicParts.length > 2 ? topicParts.slice(2).join('/') : '';
      const payloadString = message.payload?.toString?.() ?? String(message.payload);

      // Find site object once here
      const sites = await workspace.find<IWorkspaceModelWithId>({ name: siteName });
      if (sites.length === 0) {
        throw new Error(`Site ${siteName} not found`);
      }
      const site = sites[0];

      // Write to file for monitoring
      const dir = `data_test/${siteName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const fileName = `data_test/${siteName}/${batteryId}-${dataPoint || 'root'}-${new Date().toDateString()}.json`;
      fs.writeFileSync(fileName, payloadString);

      // console.log(`[BATTERY] Topic: ${topic} | Payload: ${payloadString}`);

      // Call correct handler based on dataPoint, passing the site object
      switch (dataPoint) {
        // case '': {
        //   await this.processMainBatteryData(site, batteryId, payloadString, dataPoint);
        //   break;
        // }
        case 'V_Total': {
          console.log('V_Total', payloadString);
          await this.processBatteryVTotal(site, batteryId, payloadString, dataPoint);
          break;
        }
        case 'Arus': {
          console.log('Arus', payloadString);
          await this.processBatteryCurrent(site, batteryId, payloadString, dataPoint);
          break;
        }
        case 'SOC': {
          await this.processBatterySoc(site, batteryId, payloadString, dataPoint);
          break;
        }
        case 'Suhu_Power_Tube': {
          await this.processBatteryTemperature(site, batteryId, 'Suhu_Power_Tube', payloadString, dataPoint);
          break;
        }
        case 'Suhu_Balancing_Board': {
          await this.processBatteryTemperature(site, batteryId, 'Suhu_Balancing_Board', payloadString, dataPoint);
          break;
        }
        case 'Suhu_Baterai': {
          await this.processBatteryTemperature(site, batteryId, 'Suhu_Baterai', payloadString, dataPoint);
          break;
        }
        case 'Jumlah_Siklus': {
          await this.processBatteryCycleCount(site, batteryId, payloadString, dataPoint);
          break;
        }
        case dataPoint && dataPoint.startsWith('Tegangan_Sel') ? dataPoint : undefined: {
          await this.processBatteryCellVoltages(site, batteryId, payloadString, dataPoint);
          break;
        }
        // default:
        //   console.log(`[BATTERY] Unrecognized battery subtopic: ${dataPoint}`);
      }
    } catch (err) {
      console.error(`[BATTERY] Error handling custom battery topic: ${topic}`, err);
    }
  };

  // Individual battery-related handlers, now accepting the site object and topic, saving all values to metrics.value and topic

  processMainBatteryData = async (site: IWorkspaceModelWithId, batteryId: string, payload: string, topic: string) => {
    // Assume main telemetry comma-separated: voltage,current,power,temperature,humidity,heat-index
    // (customize as needed)
    const [voltage, current, power, temperature, humidity, heatIndex] = (payload || '').split(',');
    const metricsValue: any = {
      voltage: voltage ? Number(voltage) : null,
      current: current ? Number(current) : null,
      power: power ? Number(power) : null,
      temperature: temperature !== undefined ? temperature : null,
      humidity: humidity !== undefined ? humidity : null,
      heatIndex: heatIndex !== undefined ? heatIndex : null
    };

    // Save data
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { raw: payload },
      metrics: { value: metricsValue },
      voltage: voltage ? Number(voltage).toFixed(3) : null,
      current: current ? Number(current).toFixed(3) : null,
      power: power ? Number(power).toFixed(3) : null,
      temperature,
      humidity,
      heatIndex,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] Main data ingested for ${batteryId}@${site.name ?? site._id}`);
  };

  processBatteryVTotal = async (site: any, batteryId: string, payload: string, topic: string) => {
    const metricsValue: any = {
      value: payload ? Number(payload) : null
    };
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { raw: payload },
      metrics: metricsValue,
      voltage: payload ? Number(payload).toFixed(3) : null,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] V_Total ingested for ${batteryId}@${site.name ?? site._id}`);
  };

  processBatteryCurrent = async (site: any, batteryId: string, payload: string, topic: string) => {
    const metricsValue: any = {
      value: payload ? Number(payload) : null
    };
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { raw: payload },
      metrics: metricsValue,
      current: payload ? Number(payload).toFixed(3) : null,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] Arus ingested for ${batteryId}@${site.name ?? site._id}`);
  };

  processBatterySoc = async (site: any, batteryId: string, payload: string, topic: string) => {
    const metricsValue: any = {
      value: payload ? Number(payload) : null
    };
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { soc: payload },
      metrics: metricsValue,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] SOC ingested for ${batteryId}@${site.name ?? site._id}`, payload);
  };

  processBatteryTemperature = async (site: any, batteryId: string, tempType: string, payload: string, topic: string) => {
    const metricsValue: any = {
      value: payload ? Number(payload) : null
    };
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { tempType, value: payload },
      metrics: metricsValue,
      temperature: payload ? Number(payload).toFixed(3) : null,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] Temperature (${tempType}) ingested for ${batteryId}@${site.name ?? site._id}`);
  };

  processBatteryCycleCount = async (site: any, batteryId: string, payload: string, topic: string) => {
    const metricsValue: any = {
      value: payload ? Number(payload) : null
    };
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { cycleCount: payload },
      metrics: metricsValue,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] Cycle count ingested for ${batteryId}@${site.name ?? site._id}: ${payload}`);
  };

  processBatteryCellVoltages = async (site: any, batteryId: string, payload: string, topic: string) => {
    // For cell voltages, may decode CSV or JSON string for multiple cells.
    // Here we just store the raw for now.
    const metricsValue: any = {
      value: payload ? Number(payload) : null
    };
    await batteryData.create({
      siteId: site._id,
      uuid: batteryId,
      topic,
      metadata: { cellVoltages: payload },
      metrics: metricsValue,
      sentAt: new Date()
    });
    // console.log(`[BATTERY] Cell voltages ingested for ${batteryId}@${site.name ?? site._id}`);
  };

  processMessage = async (topic: string, siteId: any, type: string, devicePartId_: DeviceType | string, payload: string) => {
    const parameters = this._parseDataString(payload, type as DeviceType);
    const deviceId = '6609400e75bea81a6ddac66e';

    switch (type) {
      case 'batteries':
        return await batteryData.create({
          siteId: siteId,
          deviceId: deviceId,
          uuid: devicePartId_,
          metadata: { raw: payload },
          voltage: parameters.voltage ? Number(parameters.voltage).toFixed(3) : null,
          current: parameters.current ? Number(parameters.current).toFixed(3) : null,
          power: parameters.power ? Number(parameters.power).toFixed(3) : null,
          temperature: parameters.temperature,
          humidity: parameters.humidity,
          heatIndex: parameters.heatIndex,
          sentAt: new Date() // should be from site
        });
      case 'inverters-ac-input':
        return await inverterData.create({
          siteId: siteId,
          deviceId: deviceId,
          uuid: devicePartId_,
          metadata: { raw: payload },
          acVoltageIn: parameters.voltage ? Number(parameters.voltage).toFixed(3) : null,
          acCurrentIn: parameters.current ? Number(parameters.current).toFixed(3) : null,
          acPowerIn: parameters.power ? Number(parameters.power).toFixed(3) : null,
          sentAt: new Date() // should be from site
        });
      case 'inverters-ac-output':
        return await inverterData.create({
          siteId: siteId,
          deviceId: deviceId,
          uuid: devicePartId_,
          metadata: { raw: payload },
          acVoltageOut: parameters.voltage ? Number(parameters.voltage).toFixed(3) : null,
          acCurrentOut: parameters.current ? Number(parameters.current).toFixed(3) : null,
          acPowerOut: parameters.power ? Number(parameters.power).toFixed(3) : null,
          sentAt: new Date() // should be from site
        });
      case 'pv-modules':
        return await panelData.create({
          siteId: siteId,
          deviceId: deviceId,
          inverterId: devicePartId_,
          metadata: { raw: payload },
          lux: parameters.lux ? Number(parameters.lux).toFixed(3) : null,
          temperature: parameters.temperature ? Number(parameters.temperature).toFixed(3) : null,
          voltage: parameters.voltage ? Number(parameters.voltage).toFixed(3) : null,
          current: parameters.current ? Number(parameters.current).toFixed(3) : null,
          power: parameters.power ? Number(parameters.power).toFixed(3) : null,
          sentAt: new Date() // should be from site
        });
      default:
        throw 'Invalid type';
    }
  };

  _getTopicInformation = (topic: string) => {
    const parts = topic.split('/');
    if (parts.length >= 4 && parts[0] === 'batari-energy') {
      return {
        siteId: parts[1],
        type: parts[2] === 'inverters' ? `${parts[2]}-${parts[4]}` : parts[2],
        deviceId: parts[3]
      };
    } else {
      throw new Error('Invalid topic format');
    }
  };

  _parseDataString = (dataString: string, type: DeviceType) => {
    const parameters = dataString.split(',').map(param => (param === 'nan' ? null : param));
    switch (type) {
      case 'batteries':
        return {
          batteryId: parameters[0],
          voltage: parameters[1],
          current: parameters[2],
          power: parameters[3],
          temperature: parameters[4],
          humidity: parameters[5],
          heatIndex: parameters[6]
        };
      case 'inverters-ac-input':
      case 'inverters-ac-output':
        return {
          inverterId: parameters[0],
          voltage: parameters[1],
          current: parameters[2],
          power: parameters[3]
        };
      case 'pv-modules':
        return {
          inverterId: parameters[0],
          voltage: parameters[1],
          current: parameters[2],
          power: parameters[3],
          temperature: parameters[4],
          lux: parameters[5]
        };
      default:
        throw 'Invalid MQTT device type!';
    }
  };
}

export default Messenger;
