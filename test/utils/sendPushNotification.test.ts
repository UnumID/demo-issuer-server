import firebaseAdmin from 'firebase-admin';

import { sendPushNotification } from '../../src/utils/sendPushNotification';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  messaging: jest.fn(),
  credential: { cert: jest.fn() }
}));

describe('sendPushNotification', () => {
  it('sends a message via firebase admin', async () => {
    const dummyMessaging = { sendMulticast: jest.fn() };
    (firebaseAdmin.messaging as jest.Mock).mockReturnValue(dummyMessaging);
    await sendPushNotification('dummy deeplink', ['dummy token']);

    expect(firebaseAdmin.messaging).toBeCalled();
    expect(dummyMessaging.sendMulticast).toBeCalledWith({
      notification: {
        title: 'Authentication Request: ACME website',
        body: 'Click here to complete'
      },
      data: { deeplink: 'dummy deeplink' },
      tokens: ['dummy token']
    });
  });
});
