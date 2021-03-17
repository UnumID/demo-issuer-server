import { PushNotificationService } from '../../../../src/services/api/pushNotification/pushNotification.class';
import { sendPushNotification } from '../../../../src/utils/sendPushNotification';
import { dummyUser } from '../../../mocks';
import { Application } from '../../../../src/declarations';

jest.mock('../../../../src/utils/sendPushNotification');

describe('PushNotificationService', () => {
  describe('create', () => {
    it('sends a push notification', async () => {
      const app = {
        service: () => ({ get: () => dummyUser })
      } as unknown as Application;

      const service = new PushNotificationService(app);
      await service.create({ userUuid: dummyUser.uuid, deeplink: 'dummy deeplink' });
      expect(sendPushNotification).toBeCalledWith('dummy deeplink', []);
    });
  });
});
