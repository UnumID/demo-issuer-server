import { NotFound } from '@feathersjs/errors';
import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { v4 } from 'uuid';

import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { User } from '../../../src/entities/User';
import { expectNonNullishValuesToBeEqual } from '../../helpers/expectNonNullishValuesToBeEqual';
import { resetDb } from '../../helpers/resetDb';
describe('UserDataService', () => {
  describe('initializing the service', () => {
    it('registers with the app', async () => {
      const app = await generateApp();
      const service = app.service('userData');
      expect(service).toBeDefined();
    });
  });

  describe('using the service', () => {
    let app: Application;
    let service: MikroOrmService;

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('userData');
    });

    afterEach(async () => {
      const orm = app.get('orm');
      await resetDb(orm);
    });

    describe('create', () => {
      it('saves a user in the database', async () => {
        const options = {
          email: 'test@unumid.org',
          password: 'test'
        };

        const user = await service.create(options);
        const savedUser = await service.get(user.uuid);

        // comparing individual properties rather than the whole object
        // because mikro-orm omits keys when the value is undefined (on create)
        // but returns a value of null when it's null in the db (on get)
        expect(savedUser.uuid).toEqual(user.uuid);
        expect(savedUser.email).toEqual(user.email);
        expect(savedUser.createdAt).toEqual(user.createdAt);
      });
    });

    describe('get', () => {
      let user: User;

      beforeEach(async () => {
        const options = {
          email: 'test@unumid.org',
          password: 'test'
        };

        const options2 = {
          email: 'test2@unumid.org',
          password: 'test'
        };

        user = await service.create(options);
        await service.create(options2);
      });

      it('gets a user from the database by uuid', async () => {
        const gottenUser = await service.get(user.uuid);
        // comparing individual properties rather than the whole object
        // because mikro-orm omits keys when the value is undefined (on create)
        // but returns a value of null when it's null in the db (on get)
        expect(gottenUser.uuid).toEqual(user.uuid);
        expect(gottenUser.email).toEqual(user.email);
        expect(gottenUser.createdAt).toEqual(user.createdAt);
      });

      it('gets a user from the db by a query', async () => {
        const gottenUser = await service.get(null, { query: { where: { email: 'test@unumid.org' } } });
        // comparing individual properties rather than the whole object
        // because mikro-orm omits keys when the value is undefined (on create)
        // but returns a value of null when it's null in the db (on get)
        expect(gottenUser.uuid).toEqual(user.uuid);
        expect(gottenUser.email).toEqual(user.email);
        expect(gottenUser.createdAt).toEqual(user.createdAt);
      });
    });

    describe('find', () => {
      let user1: User;
      let user2: User;

      beforeEach(async () => {
        const options = {
          email: 'test@unumid.org',
          password: 'test'
        };

        const options2 = {
          email: 'test2@unumid.org',
          password: 'test'
        };

        user1 = await service.create(options);
        user2 = await service.create(options2);
      });

      it('gets all users from the database', async () => {
        const users = await service.find() as User[];
        expect(users.length).toEqual(2);
        expectNonNullishValuesToBeEqual(users[0], user1);
        expectNonNullishValuesToBeEqual(users[1], user2);
      });

      it('gets users from the db by a query', async () => {
        const users = await service.find({ query: { email: 'test@unumid.org' } }) as User[];
        expect(users.length).toEqual(1);
        expectNonNullishValuesToBeEqual(users[0], user1);
      });
    });

    describe('patch', () => {
      let user: User;

      beforeEach(async () => {
        const options = {
          email: 'test@unumid.org',
          password: 'test'
        };

        const options2 = {
          email: 'test2@unumid.org',
          password: 'test'
        };

        user = await service.create(options);
        await service.create(options2);
      });

      it('patches a user', async () => {
        const changes = { did: `did:unum:${v4()}` };

        const patchedUser = await service.patch(user.uuid, changes);
        expect(patchedUser.uuid).toEqual(user.uuid);
        expect(patchedUser.createdAt).toEqual(user.createdAt);
        expect(patchedUser.updatedAt.getTime()).toBeGreaterThan(user.createdAt.getTime());
        expect(patchedUser.email).toEqual(user.email);
        expect(patchedUser.did).toEqual(changes.did);
      });
    });

    describe('remove', () => {
      let user: User;

      beforeEach(async () => {
        const options = {
          email: 'test@unumid.org',
          password: 'test'
        };

        const options2 = {
          email: 'test2@unumid.org',
          password: 'test'
        };

        user = await service.create(options);
        await service.create(options2);
      });

      it('deletes a user', async () => {
        await service.remove(user.uuid);
        try {
          await service.get(user.uuid);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(NotFound);
        }
      });
    });
  });
});
