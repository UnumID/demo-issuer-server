import firebaseAdmin from 'firebase-admin';

firebaseAdmin.initializeApp();

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
