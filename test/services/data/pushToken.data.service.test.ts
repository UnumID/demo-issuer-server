import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { User } from '../../../src/entities/User';
import { PushTokenDataService } from '../../../src/services/data/pushToken.data.service';
import { expectNonNullishValuesToBeEqual } from '../../helpers/expectNonNullishValuesToBeEqual';
import { resetDb } from '../../helpers/resetDb';

describe('PushTokenDataService', () => {
  describe('initializing the service', () => {
    it('registers with the app', async () => {
      const app = await generateApp();
      const service = app.service('pushTokenData');
      expect(service).toBeDefined();
    });
  });

  describe('using the service', () => {
    let app: Application;
    let service: PushTokenDataService;
    let user: User;

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('pushTokenData');

      const userOptions = {
        email: 'test@unum.id',
        password: 'test'
      };

      user = await app.service('userData').create(userOptions);
    });

    afterEach(async () => {
      const orm = app.get('orm');
      await resetDb(orm);
    });

    describe('create', () => {
      it('saves a pushToken in the database', async () => {
        const options = {
          value: 'dummy token',
          provider: 'FCM',
          user
        };

        const pushToken = await service.create(options);
        // `populate` param doesn't appear to work with create method,
        // so we have to init the collection
        await pushToken.users.init();
        const retrievedPushToken = await service.get(pushToken.uuid, { populate: ['users'] });
        expectNonNullishValuesToBeEqual(retrievedPushToken, pushToken);
      });
    });

    describe('get', () => {
      it('gets a pushToken from the database by uuid', async () => {
        const options = {
          value: 'dummy token',
          provider: 'FCM',
          user
        };

        const pushToken = await service.create(options);
        // `populate` param doesn't appear to work with create method,
        // so we have to init the collection
        await pushToken.users.init();
        const retrievedPushToken = await service.get(pushToken.uuid, { populate: ['users'] });
        expectNonNullishValuesToBeEqual(retrievedPushToken, pushToken);
      });

      it('gets a fcmRegistrationToken from the database by a query', async () => {
        const options = {
          value: 'dummy token',
          provider: 'FCM',
          user
        };

        const pushToken = await service.create(options);
        // `populate` param doesn't appear to work with create method,
        // so we have to init the collection
        await pushToken.users.init();
        const retrievedPushToken = await service.get(null, { query: { where: { value: 'dummy token' } }, populate: ['users'] });
        expectNonNullishValuesToBeEqual(retrievedPushToken, pushToken);
      });
    });

    describe('patch', () => {
      it('patches a pushToken', async () => {
        const options = {
          value: 'dummy token',
          provider: 'FCM',
          user
        };

        const pushToken = await service.create(options);

        const userOptions2 = {
          email: 'test2@unum.id',
          password: 'test'
        };

        const user2 = await app.service('userData').create(userOptions2);

        const patchOptions = {
          user: user2
        };

        const patchedPushToken = await service.patch(pushToken.uuid, patchOptions);
        expect(patchedPushToken.user).toEqual(user2);
      });
    });

    describe('getByToken', () => {
      it('gets a pushToken by the token value', async () => {
        const options = {
          value: 'dummy token',
          provider: 'FCM',
          user
        };

        const pushToken = await service.create(options);

        const retrievedPushToken = await service.getByToken('dummy token');
        expect(retrievedPushToken.uuid).toEqual(pushToken.uuid);
      });
    });
  });
});
