import firebaseAdmin from 'firebase-admin';

import { config } from '../config';

export const sendPushNotification = async (deeplink: string, tokens: string[]): Promise<any> => {
  firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(config.FIREBASE_CONFIG) });
  const message = {
    notification: {
      title: 'Authentication Request: ACME website',
      body: 'Click here to complete'
    },
    data: { deeplink },
    tokens
  };
  const result = await firebaseAdmin.messaging().sendMulticast(message);
  return result;
};
