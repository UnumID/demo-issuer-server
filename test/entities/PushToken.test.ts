import { MikroORM } from '@mikro-orm/core';

import { PushToken, PushTokenOptions } from '../../src/entities/PushToken';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyUser } from '../mocks';

describe('FcmRegistrationToken entity', () => {
  const dummyToken = 'dummy fcm token';
  let options: PushTokenOptions;
  let pushToken: PushToken;

  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init(mikroOrmConfig);
    await orm.em.persistAndFlush(dummyUser);

    options = { value: dummyToken, user: dummyUser, provider: 'FCM' };
    pushToken = new PushToken(options);
  });

  afterAll(async () => {
    await resetDb(orm);
  });

  it('generates a uuid', () => {
    expect(pushToken.uuid).toBeDefined();
  });

  it('generates createdAt and updatedAt dates', () => {
    expect(pushToken.createdAt).toBeDefined();
    expect(pushToken.updatedAt).toBeDefined();
    expect(pushToken.updatedAt).toEqual(pushToken.createdAt);
  });

  it('sets the token value, user, and provider from options', () => {
    expect(pushToken.value).toEqual(options.value);
    expect(pushToken.users).toContainEqual(options.user);
    expect(pushToken.provider).toEqual(options.provider);
  });

  describe('storage behavior', () => {
    it('saves the pushToken in the database', async () => {
      await orm.em.persistAndFlush(pushToken);

      // clear the identity map so that we make a database call instead of just returning the cached entity
      orm.em.clear();

      const savedPushToken = await orm.em.findOneOrFail(PushToken, pushToken.uuid, ['users']);
      expect(savedPushToken.uuid).toEqual(pushToken.uuid);
      expect(savedPushToken.value).toEqual(pushToken.value);
      expect(savedPushToken.users.getIdentifiers()).toEqual(pushToken.users.getIdentifiers());
    });
  });
});
