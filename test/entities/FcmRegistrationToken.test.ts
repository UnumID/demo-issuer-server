import { MikroORM } from '@mikro-orm/core';

import { FcmRegistrationToken } from '../../src/entities/FcmRegistrationToken';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyUser } from '../mocks';

describe('FcmRegistrationToken entity', () => {
  const dummyToken = 'dummy fcm token';

  const options = { token: dummyToken, user: dummyUser };
  const fcmRegistrationToken = new FcmRegistrationToken(options);

  it('generates a uuid', () => {
    expect(fcmRegistrationToken.uuid).toBeDefined();
  });

  it('generates createdAt and updatedAt dates', () => {
    expect(fcmRegistrationToken.createdAt).toBeDefined();
    expect(fcmRegistrationToken.updatedAt).toBeDefined();
    expect(fcmRegistrationToken.updatedAt).toEqual(fcmRegistrationToken.createdAt);
  });

  it('sets the fcmRegistrationToken and user from options', () => {
    expect(fcmRegistrationToken.token).toEqual(options.token);
    expect(fcmRegistrationToken.user).toEqual(options.user);
  });

  describe('storage behavior', () => {
    let orm: MikroORM;

    beforeEach(async () => {
      orm = await MikroORM.init(mikroOrmConfig);
    });

    afterEach(async () => {
      await resetDb(orm);
    });

    it('saves the fcmRegistrationToken in the database', async () => {
      await orm.em.persistAndFlush(dummyUser);
      await orm.em.persistAndFlush(fcmRegistrationToken);
      orm.em.clear();

      const savedFcmRegistrationToken = await orm.em.findOneOrFail(FcmRegistrationToken, fcmRegistrationToken.uuid);
      expect(savedFcmRegistrationToken.uuid).toEqual(fcmRegistrationToken.uuid);
      expect(savedFcmRegistrationToken.token).toEqual(fcmRegistrationToken.token);
      expect(savedFcmRegistrationToken.user.uuid).toEqual(fcmRegistrationToken.user.uuid);
    });
  });
});
