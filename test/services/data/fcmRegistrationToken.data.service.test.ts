import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { User } from '../../../src/entities/User';
import { FcmRegistrationTokenDataService } from '../../../src/services/data/fcmRegistrationToken.data.service';
import { resetDb } from '../../helpers/resetDb';

describe('FcmRegistrationTokenDataService', () => {
  describe('initializing the service', () => {
    it('registers with the app', async () => {
      const app = await generateApp();
      const service = app.service('fcmRegistrationTokenData');
      expect(service).toBeDefined();
    });
  });

  describe('using the service', () => {
    let app: Application;
    let service: FcmRegistrationTokenDataService;
    let user: User;

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('fcmRegistrationTokenData');

      const userOptions = {
        email: 'test@unum.id',
        password: 'test'
      };

      user = await app.service('userData').create(userOptions);
    });

    afterEach(async () => {
      const orm = app.get('orm');
      orm.em.clear();
      await resetDb(orm);
    });

    describe('create', () => {
      it('saves a fcmRegistrationToken in the database', async () => {
        const options = {
          token: 'dummy token',
          user
        };

        const fcmRegistrationToken = await service.create(options);
        const retrievedFcmRegistrationToken = await service.get(fcmRegistrationToken.uuid);
        expect(retrievedFcmRegistrationToken).toEqual(fcmRegistrationToken);
      });
    });

    describe('get', () => {
      it('gets a fcmRegistrationToken from the database by uuid', async () => {
        const options = {
          token: 'dummy token',
          user
        };

        const fcmRegistrationToken = await service.create(options);
        const retrievedFcmRegistrationToken = await service.get(fcmRegistrationToken.uuid);
        expect(retrievedFcmRegistrationToken).toEqual(fcmRegistrationToken);
      });

      it('gets a fcmRegistrationToken from the database by a query', async () => {
        const options = {
          token: 'dummy token',
          user
        };

        const fcmRegistrationToken = await service.create(options);
        const retrievedFcmRegistrationToken = await service.get(null, { query: { where: { token: 'dummy token' } } });
        expect(retrievedFcmRegistrationToken).toEqual(fcmRegistrationToken);
      });
    });

    describe('patch', () => {
      it('patches a fcmRegistrationToken', async () => {
        const options = {
          token: 'dummy token',
          user
        };

        const fcmRegistrationToken = await service.create(options);

        const userOptions2 = {
          email: 'test2@unum.id',
          password: 'test'
        };

        const user2 = await app.service('userData').create(userOptions2);

        const patchOptions = {
          user: user2
        };

        const patchedFcmRegistrationToken = await service.patch(fcmRegistrationToken.uuid, patchOptions);
        expect(patchedFcmRegistrationToken.user).toEqual(user2);
      });
    });

    describe('getByToken', () => {
      it('gets a fcmRegistrationToken by the token value', async () => {
        const options = {
          token: 'dummy token',
          user
        };
        const fcmRegistrationToken = await service.create(options);

        const retrievedFcmRegistrationToken = await service.getByToken('dummy token');
        expect(retrievedFcmRegistrationToken).toEqual(fcmRegistrationToken);
      });
    });
  });
});
