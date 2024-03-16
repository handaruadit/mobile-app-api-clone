
import { inverterData } from '@/models';
import MQTT from './mqtt';

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

  processContents = (msg: { content: object }) => {
    if (!msg) {
      return;
    }

    const message = JSON.parse(msg.content.toString());
    if (message) {
      // add process message here
      this.processMessage(message.type, message.id, message.data)
        .then(() => {
          this.mqtt.channel.ack(msg);
        })
        .catch((error) => {
          console.error('Failed to acknowledge');
          console.log(error);
          this.mqtt.channel.nack(msg);
        });

      return;
    }

    this.mqtt.channel.ack(msg);
  };

  /**
   * This function must have a return statement in order to send acknowledge to RabbitMQ
   * @param type 
   * @param id 
   * @param payload 
   * @returns 
   */
  processMessage = async (type: string, id: string, payload: any) => {
    switch (type) {
      case 'inverter.main-data':
        // Send acknowledgment
        const saving = await inverterData.create({
          siteId: payload.site_id,
          inverterId: payload.inverter_id,
          metadata: payload.metadata,
          panelVoltage: payload.panel_voltage,
          batteryVoltage: payload.battery_voltage,
          panelCurrent: payload.panel_current,
          batteryCurrent: payload.battery_current,
          panelPower: payload.panel_power,
          batteryPower: payload.battery_power,
          sentAt: payload.sent_at,
          receivedAt: new Date()
        });
        return saving;
      case 'inverter.status':
        console.log('status data', type, id, payload);
        break;
      default:
        throw 'Invalid type';
    }
  };
}

export default Messenger;
