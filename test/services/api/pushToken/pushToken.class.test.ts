import { Service as MikroOrmService } from 'feathers-mikro-orm';

import { PushTokenCreateOptions, PushTokenService } from '../../../../src/services/api/pushToken/pushToken.class';
import { dummyUser, dummyUser2 } from '../../../mocks';
import { Application } from '../../../../src/declarations';
import { PushToken } from '../../../../src/entities/PushToken';
import { MikroORM } from '@mikro-orm/core';
import { resetDb } from '../../../helpers/resetDb';
import generateApp from '../../../../src/app';
import { User } from '../../../../src/entities/User';
import { PushTokenDataService } from '../../../../src/services/data/pushToken.data.service';

describe('PushTokenService class', () => {
  let orm: MikroORM;
  let app: Application;
  let pushTokenService: PushTokenService;
  let userDataService: MikroOrmService<User>;
  let pushTokenDataService: PushTokenDataService;

  beforeAll(async () => {
    app = await generateApp();
    orm = app.get('orm');
    pushTokenService = app.service('pushToken');
    userDataService = app.service('userData');
    pushTokenDataService = app.service('pushTokenData');
  });

  afterEach(async () => {
    await resetDb(orm);
    orm.em.clear();
  });

  describe('create', () => {
    it('saves and returns a new pushToken if there is no existing token with the value', async () => {
      // leaving in commented out orm/em implementation as a reminder that it does NOT work
      // as it causes other tests in this suite to fail. Still not sure why ¯\_(ツ)_/¯
      // await orm.em.persistAndFlush(dummyUser);
      await userDataService.create(dummyUser);

      const options: PushTokenCreateOptions = {
        value: 'test token',
        userUuid: dummyUser.uuid,
        provider: 'FCM'
      };
      const newToken = await pushTokenService.create(options);

      await newToken.users.init();
      expect(newToken.uuid).toBeDefined();

      // make sure the value was set correctly
      expect(newToken.value).toEqual(options.value);

      // make sure it was associated with the user
      expect(newToken.users.getIdentifiers()).toContainEqual(dummyUser.uuid);

      // make sure that the token was persisted correctly
      // clear the identity map to simulate a new request
      orm.em.clear();

      // const savedToken = await orm.em.findOneOrFail(PushToken, { uuid: newToken.uuid }, ['users']);
      const savedToken = await pushTokenDataService.get(newToken.uuid, { populate: ['users'] });

      // value was saved correctly
      expect(savedToken.value).toEqual(options.value);

      // user relationship was saved correctly
      await savedToken.users.init();
      expect(savedToken.users.count()).toEqual(1);
      expect(savedToken.users.getIdentifiers()).toContainEqual(dummyUser.uuid);
    });

    it('does not create or update anything if the existing token is already with the user', async () => {
      // leaving in (commented out) orm/em implementation as a reminder that it does NOT work
      // as it causes other tests in this suite to fail. Still not sure why ¯\_(ツ)_/¯
      // await orm.em.persistAndFlush(dummyUser);
      await userDataService.create(dummyUser);

      const options: PushTokenCreateOptions = {
        value: 'test token',
        userUuid: dummyUser.uuid,
        provider: 'FCM'
      };

      // create the initial token
      const created = await pushTokenService.create(options);

      expect(created.uuid).toBeDefined();

      // we really care about what is persisted, not what's returned from the create call
      // clear the identity map to simulate a new request
      orm.em.clear();
      // const token1 = await orm.em.findOneOrFail(PushToken, { uuid: created.uuid }, ['users']);
      const token1 = await pushTokenDataService.get(created.uuid, { populate: ['users'] });
      await token1.users.init();

      // clear the identity map to simulate a new request
      orm.em.clear();

      // create again with the same values
      const recreated = await pushTokenService.create(options);

      // we really care about what was persisted, not what was returned from the create call
      // clear the identity map to simulate a new request
      orm.em.clear();
      // const token2 = await orm.em.findOneOrFail(PushToken, { uuid: recreated.uuid }, ['users']);
      const token2 = await pushTokenDataService.get(recreated.uuid);
      await token2.users.init();

      expect(token2).toEqual(token1);

      // should only be one token in the database
      // const count = await orm.em.count(PushToken);
      const tokens = await pushTokenDataService.find();
      const count = tokens.length;
      expect(count).toEqual(1);
    });

    it('associates the existing token with the user if it is not already', async () => {
      // leaving in (commented out) orm/em implementation as a reminder that it does NOT work
      // as it causes other tests in this suite to fail. Still not sure why ¯\_(ツ)_/¯
      // await orm.em.persistAndFlush(dummyUser);
      // await orm.em.persistAndFlush(dummyUser2);

      await userDataService.create(dummyUser);
      await userDataService.create(dummyUser2);

      const options: PushTokenCreateOptions = {
        value: 'test token',
        userUuid: dummyUser.uuid,
        provider: 'FCM'
      };

      // create the initial token
      await pushTokenService.create(options);

      // clear the identity map to simulate a new request
      orm.em.clear();

      // create the token again with the same value but a different user
      const options2: PushTokenCreateOptions = {
        ...options,
        userUuid: dummyUser2.uuid
      };

      const recreated = await pushTokenService.create(options2);

      // the token should now be associated with both users
      expect(recreated.users.getIdentifiers()).toContainEqual(dummyUser.uuid);
      expect(recreated.users.getIdentifiers()).toContainEqual(dummyUser2.uuid);

      // there should still only be one token in the database
      const count = await orm.em.count(PushToken);
      expect(count).toEqual(1);
    });
  });
});
