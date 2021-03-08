import { EntityRepository, MikroORM } from '@mikro-orm/core';

import { User } from '../../src/entities/User';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';

describe('User entity', () => {
  const options = {
    email: 'test@unumid.org',
    password: 'test'
  };

  const user = new User(options);
  describe('constructor behavior', () => {
    it('generates a uuid', () => {
      expect(user.uuid).toBeDefined();
    });

    it('generates createdAt and updatedAt dates', () => {
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.updatedAt).toEqual(user.createdAt);
    });

    it('sets the email and password from options', () => {
      expect(user.email).toEqual(options.email);
      expect(user.password).toEqual(options.password);
    });

    it('initializes optional did and phone properties to undefined', () => {
      expect(user.did).toBeUndefined();
      expect(user.phone).toBeUndefined();
    });

    it('sets the phone properties if it id provided', () => {
      const options2 = {
        ...options,
        phone: '5555555555'
      };

      const user2 = new User(options2);

      expect(user2.phone).toEqual(options2.phone);
    });
  });

  describe('storage behavior', () => {
    let orm: MikroORM;
    let userRepository: EntityRepository<User>;

    beforeEach(async () => {
      orm = await MikroORM.init(mikroOrmConfig);
      userRepository = orm.em.getRepository(User);
    });

    afterEach(async () => {
      await resetDb(orm);
    });

    it('saves the user in the database', async () => {
      await userRepository.persistAndFlush(user);
      orm.em.clear();

      const savedUser = await userRepository.findOneOrFail(user.uuid);
      expect(savedUser.uuid).toEqual(user.uuid);
      expect(savedUser.createdAt).toEqual(user.createdAt);
      expect(savedUser.updatedAt).toEqual(user.updatedAt);
      expect(savedUser.email).toEqual(user.email);
      expect(savedUser.password).toEqual(user.password);
      expect(savedUser.did).toBeNull();
      expect(savedUser.phone).toBeNull();
    });
  });
});
