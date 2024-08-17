import admin, { ServiceAccount } from 'firebase-admin';
// TODO: changet to admin.credential.cert
import serviceAccount from '../../creds/batari-eee6e-firebase-adminsdk-pkoab-0d19970fbf.json';
export default class FirebaseApp {
  private static instance: FirebaseApp;
  messaging: admin.messaging.Messaging;

  private constructor() {
    // const credential_cert = admin.credential.cert({
    //   projectId: process.env.FIREBASE_PROJECT_ID,
    //   clientEmail: process.env.SERVICE_ACC_KEY_CLIENT_EMAIL,
    //   privateKey: process.env.SERVICE_ACC_KEY_PRIVATE_KEY
    // });

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount)
    });
    this.messaging = app.messaging();
    this.messagingTest();
  }

  public static getInstance(): FirebaseApp {
    if (!FirebaseApp.instance) {
      FirebaseApp.instance = new FirebaseApp();
    }
    return FirebaseApp.instance;
  }

  messagingTest() {
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from Firebase Admin.'
      },
      topic: 'test_topic'
    };

    this.messaging
      .send(message)
      .then(() => {
        console.log('LOG: Test notification sent successfully.');
      })
      .catch(error => {
        throw new Error(`Error sending test notification: ${error}`);
      });
  }
}
