import mqtt from 'mqtt';

import Messenger from './messenger';

class MQTT {
  private static instance: MQTT;
  connected: boolean;
  messenger: Messenger;
  client: mqtt.MqttClient;

  constructor() {
    if (!MQTT.instance) {
      this.connected = false;
      this.messenger = new Messenger(this);
      MQTT.instance = this;
    }

    return MQTT.instance;
  }

  connect = (onConnected?: () => void, onDisconnected?: () => void) => {
    console.log('Connecting to broker: ', process.env.HIVEMQ_URI_BATARI);
    const conn = mqtt.connect(process.env.HIVEMQ_URI_BATARI ?? '', {
      username: process.env.HIVEMQ_USERNAME,
      password: process.env.HIVEMQ_PASSWORD,
      port: 8883,
      protocol: 'mqtts',
      rejectUnauthorized: false,
      clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    });

    conn.on('connect', () => {
      console.log('MQTT Connected');
      this.connected = true;
      if (onConnected) {
        onConnected();
      }
    });

    conn.on('disconnect', () => {
      console.log('MQTT Disconnected');
      this.connected = false;
      if (onDisconnected) {
        onDisconnected();
      }
    });

    conn.on('offline', () => {
      console.log('Client is offline');
    });

    conn.on('reconnect', () => {
      console.log('Reconnecting to MQTT broker');
    });

    conn.on('end', () => {
      console.log('MQTT ended');
      this.connected = false;
      if (onDisconnected) {
        onDisconnected();
      }
    });

    conn.on('error', e => {
      console.error('Error occured', e);
    });

    this.client = conn;
    this.addMainSubscriber();
    const siteName = process.env.SITE_NAME;
    const batteryId = process.env.BATERAI_NAME;
    if (!siteName || !batteryId) {
      console.error('Missing NAMA_SITE or ID_BATERAI environment variables');
      return;
    }
    this.addBatterySubscriber(siteName, batteryId);
  };

  addMainSubscriber = () => {
    this.client.subscribe('batari-energy/#');
    console.log('Subscribed to batari-energy/#');
    // this.client.subscribe('batari-energy/st-id/batteries/bat-id');
    this.messenger.processContents();
  };

  closeConnection = async () => {
    if (this.client) this.client.end();
  };

  addBatterySubscriber = (siteName: string, batteryId: string) => {
    const baseTopic = `${siteName}/${batteryId}`;
    const topics = [
      baseTopic,
      `${baseTopic}/V_Total`,
      `${baseTopic}/Arus`,
      `${baseTopic}/SOC`,
      `${baseTopic}/Suhu_Power_Tube`,
      `${baseTopic}/Suhu_Balancing_Board`,
      `${baseTopic}/Suhu_Baterai`,
      `${baseTopic}/Jumlah_Siklus`,
      `${baseTopic}/Baterai/Tegangan_Sel`
    ];

    this.client.subscribe(siteName + "/#", (err: any) => {
      if (err) {
        console.error(`Failed to subscribe to topic: ${siteName+"/#"}`, err);
      } else {
        console.log(`Subscribed to topic: ${siteName+"/#"}`);
      }
    });

    topics.forEach(topic => {
      this.client.subscribe(topic, (err: any) => {
        if (err) {
          console.error(`Failed to subscribe to topic: ${topic}`, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });
  };

  // publishToQueues = (queuesArray: string[], payload: any) => {
  //   const data = JSON.stringify(payload);

  //   const promises = [];
  //   for (const queueName of queuesArray) {
  //     if (this.channel) {
  //       promises.push(this.channel.sendToQueue(queueName, Buffer.from(data)));
  //     }
  //   }

  //   return Promise.all(promises);
  // };
}

export default MQTT;
