import fs from 'fs';
import { batteryData, inverterData, panelData } from '@/models';
import MQTT from './mqtt';

type DeviceType = 'batteries' | 'inverters-ac-input' | 'inverters-ac-output' | 'pv-modules';
// type DeviceType = 'batteries' | 'invertert' | 'pv-modules';

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
    // eslint-disable-next-line no-empty-pattern
    this.mqtt.client.on('message', (topic, {}, message) => {
      console.log(`Received message on topic ${topic}`);
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
        // add process message here
        this.processMessage(topic, siteId, type, deviceId, String(payloadString))
          .then(() => {
            // this.mqtt.channel.ack(msg);
            console.log('data has been processed!');
          })
          .catch(error => {
            console.error('Failed to acknowledge');
            console.log(error);
            // this.mqtt.channel.nack(msg);
          });

        return;
      }
    });
  };

  /**
   * This function must have a return statement in order to send acknowledge to RabbitMQ
   * @param type
   * @param siteId
   * @param type
   * @param devicePartId_ uuid of the part (battery or panel or inverter)
   * @returns
   */
  processMessage = async (topic: string, siteId: any, type: string, devicePartId_: DeviceType | string, payload: string) => {
    const parameters = this._parseDataString(payload, type as DeviceType);
    // temporary, TODO: find devicePartId from device model
    // find the right deviceId from given siteId
    // it's because we don't have an agreement on how to give an UUID to device
    const deviceId = '6609400e75bea81a6ddac66e';

    switch (type) {
      // battery data
      case 'batteries':
        // Send acknowledgment
        // batteryId,voltage,current,power,temperature,humidity,heat-index
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
        // inverterId,voltage,current,power,temperature,humidity,heat-index
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
        // inverterId,voltage,current,power,temperature,humidity,heat-index
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
        // inverterId,voltage,current,power,temperature,lux
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
      // battery data
      case 'batteries':
        // Send acknowledgment
        // batteryId,voltage,current,power,temperature,humidity,heat-index
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
        // batteryId,voltage,current,power,temperature,humidity,heat-index
        return {
          inverterId: parameters[0],
          voltage: parameters[1],
          current: parameters[2],
          power: parameters[3]
        };
      case 'pv-modules':
        // inverterId,voltage,current,power,temperature,lux
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
