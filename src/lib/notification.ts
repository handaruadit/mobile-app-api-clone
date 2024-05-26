import admin from 'firebase-admin';
import { BaseMessage, MulticastMessage } from 'firebase-admin/messaging';

import { IUsersDeviceModelPayload } from '@/models/usersDevice';

import FirebaseApp from './firebase';

export default class Notification {
  private static instance: Notification;
  messaging: admin.messaging.Messaging;

  private constructor() {
    const app = FirebaseApp.getInstance();
    this.messaging = app.messaging;
    Notification.instance = this;
  }

  public static getInstance(): Notification {
    if (!Notification.instance) {
      Notification.instance = new Notification();
    }
    return Notification.instance;
  }

  async sendMessage(devices: IUsersDeviceModelPayload[], message: BaseMessage, useNotifeePayload = true) {
    const tokens: string[] = [];
    devices.forEach((device) => {
      if(device.fcmToken) {
        tokens.push(device.fcmToken);
      }
    });
    if (!tokens.length) {
      return { success: 0, failure: 0 };
    }

    let messagePayload: MulticastMessage = {
      tokens
    };
    if (useNotifeePayload) {
      messagePayload.data = { notifee: JSON.stringify(message) };
    } else {
      messagePayload = { ...messagePayload, ...message };
    }

    const response = await this.messaging.sendEachForMulticast(messagePayload);
    return {
      success: response.successCount,
      failure: response.failureCount
    };
  }
}
