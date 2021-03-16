import { Service as MikroOrmService } from 'feathers-mikro-orm';

import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { User } from '../../../src/entities/User';
import { resetDb } from '../../helpers/resetDb';

describe('DeviceDataService', () => {
  describe('initializing the service', () => {
    it('registers with the app', async () => {
      const app = await generateApp();
      const service = app.service('deviceData');
      expect(service).toBeDefined();
    });
  });

  describe('using the service', () => {
    let app: Application;
    let service: MikroOrmService;
    let user: User;

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('deviceData');

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
      it('saves a device in the database', async () => {
        const options = {
          fcmRegistrationToken: 'dummy token',
          user
        };

        const device = await service.create(options);
        const retrievedDevice = await service.get(device.uuid);
        expect(retrievedDevice).toEqual(device);
      });
    });

    describe('get', () => {
      it('gets a device from the database by uuid', async () => {
        const options = {
          fcmRegistrationToken: 'dummy token',
          user
        };

        const device = await service.create(options);
        const retrievedDevice = await service.get(device.uuid);
        expect(retrievedDevice).toEqual(device);
      });

      it('gets a device from the database by a query', async () => {
        const options = {
          fcmRegistrationToken: 'dummy token',
          user
        };

        const device = await service.create(options);
        const retrievedDevice = await service.get(null, { query: { where: { fcmRegistrationToken: 'dummy token' } } });
        expect(retrievedDevice).toEqual(device);
      });
    });

    describe('patch', () => {
      it('patches a device', async () => {
        const options = {
          fcmRegistrationToken: 'dummy token',
          user
        };

        const device = await service.create(options);

        const userOptions2 = {
          email: 'test2@unum.id',
          password: 'test'
        };

        const user2 = await app.service('userData').create(userOptions2);

        const patchOptions = {
          user: user2
        };

        const patchedDevice = await service.patch(device.uuid, patchOptions);
        expect(patchedDevice.user).toEqual(user2);
      });
    });
  });
});
