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
    console.log('Connecting to broker: ', process.env.HIVEMQ_URI_BATARI)
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
    
    conn.on('error', (e) => { 
      console.error('Error occured', e);
    });


    this.client = conn;
    this.addMainSubscriber()
  };

  addMainSubscriber = () => {
    // this.client.subscribe('batari-energy/#');
    // this.client.subscribe('batari-energy/st-id/batteries/bat-id');
    this.messenger.processContents();
  }

  closeConnection = async () => {
    if (this.client) this.client.end();
  }

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
