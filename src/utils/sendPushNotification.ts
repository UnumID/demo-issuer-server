import firebaseAdmin from 'firebase-admin';

import { config } from '../config';

firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(config.FIREBASE_CONFIG) });

export const sendPushNotification = async (deeplink: string, tokens: string[]): Promise<any> => {
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
