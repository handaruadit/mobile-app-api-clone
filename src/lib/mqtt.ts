import amqplib, { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';

import { MQTT_NAME_ENUM } from '@/interfaces/mqtt';

import Messenger from './messenger';

const QUEUE = MQTT_NAME_ENUM.CORE;

class MQTT {
  private static instance: MQTT;
  connected: boolean;
  messenger: Messenger;
  channel: ChannelWrapper;
  connection: AmqpConnectionManager;
  
  constructor() {
    if (!MQTT.instance) {
      this.connected = false;
      this.messenger = new Messenger(this);
      MQTT.instance = this;
    }

    return MQTT.instance;
  }

  connect = (onConnected?: () => void, onDisconnected?: () => void) => {
    const conn = amqplib.connect(process.env.RABBITMQ_URI);

    conn.on('connect', () => {
      console.log('[AMQP] Connected');
      this.connected = true;
      if (onConnected) {
        onConnected();
      }
    });

    conn.on('disconnect', () => {
      console.log('[AMQP] Disconnected');
      this.connected = false;
      if (onDisconnected) {
        onDisconnected();
      }
    });

    this.connection = conn;
    this.channel = conn.createChannel({
      setup: (channel: ChannelWrapper) => {
        return Promise.all([
          channel.assertQueue(QUEUE, { durable: true }),
          channel.consume(QUEUE, this.messenger.processContents, { prefetch: 1 })
        ]);
      }
    });
  };

  closeConnection = async () => {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  publishToQueues = (queuesArray: string[], payload: any) => {
    const data = JSON.stringify(payload);

    const promises = [];
    for (const queueName of queuesArray) {
      if (this.channel) {
        promises.push(this.channel.sendToQueue(queueName, Buffer.from(data)));
      }
    }

    return Promise.all(promises);
  };
}

export default MQTT;
