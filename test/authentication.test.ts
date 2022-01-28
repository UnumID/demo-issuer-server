import { wrap } from '@mikro-orm/core';
import generateApp from '../src/app';
import { Application } from '../src/declarations';
import { resetDb } from './helpers/resetDb';

describe('authentication', () => {
  it('registered the authentication service', async () => {
    const app = await generateApp();
    expect(app.service('authentication')).toBeTruthy();
  });

  describe('local', () => {
    let app: Application;

    beforeEach(async () => {
      app = await generateApp();
    });

    afterEach(async () => {
      const orm = app.get('orm');
      await resetDb(orm);
    });

    it('returns push tokens', async () => {
      const user = await app.service('user').create({ email: 'test@unumid.co', password: 'test', firstName: 'test' });

      // add a push token for the user
      await app.service('pushToken').create({ value: 'test token', provider: 'APNS', userUuid: user.uuid });

      const authResponse = await app.service('authentication').create({ strategy: 'local', email: 'test@unumid.co', password: 'test' }, {});
      expect(authResponse.user.pushTokens.length).toEqual(1);
    });
  });
});
