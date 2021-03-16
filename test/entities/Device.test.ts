import { MikroORM } from '@mikro-orm/core';

import { Device } from '../../src/entities/Device';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyUser } from '../mocks';

describe('Device entity', () => {
  const dummyToken = 'dummy fcm token';

  const options = { fcmRegistrationToken: dummyToken, user: dummyUser };
  const device = new Device(options);

  it('generates a uuid', () => {
    expect(device.uuid).toBeDefined();
  });

  it('generates createdAt and updatedAt dates', () => {
    expect(device.createdAt).toBeDefined();
    expect(device.updatedAt).toBeDefined();
    expect(device.updatedAt).toEqual(device.createdAt);
  });

  it('sets the fcmRegistrationToken and user from options', () => {
    expect(device.fcmRegistrationToken).toEqual(options.fcmRegistrationToken);
    expect(device.user).toEqual(options.user);
  });

  describe('storage behavior', () => {
    let orm: MikroORM;

    beforeEach(async () => {
      orm = await MikroORM.init(mikroOrmConfig);
    });

    afterEach(async () => {
      await resetDb(orm);
    });

    it('saves the device in the database', async () => {
      await orm.em.persistAndFlush(dummyUser);
      await orm.em.persistAndFlush(device);
      orm.em.clear();

      const savedDevice = await orm.em.findOneOrFail(Device, device.uuid);
      expect(savedDevice.uuid).toEqual(device.uuid);
      expect(savedDevice.fcmRegistrationToken).toEqual(device.fcmRegistrationToken);
      expect(savedDevice.user.uuid).toEqual(device.user.uuid);
    });
  });
});
