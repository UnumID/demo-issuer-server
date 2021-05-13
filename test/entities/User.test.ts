import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';

import { User } from '../../src/entities/User';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';

describe('User entity', () => {
  const options = {
    email: 'test@unumid.org',
    password: 'test',
    firstName: 'test'
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

    it('sets the email, firstName, and password from options', () => {
      expect(user.email).toEqual(options.email);
      expect(user.password).toEqual(options.password);
      expect(user.firstName).toEqual(options.firstName);
    });

    it('initializes optional did and phone properties to undefined, and pushTokens to an empty array', () => {
      expect(user.did).toBeUndefined();
      expect(user.phone).toBeUndefined();
      expect(user.pushTokens.getItems()).toEqual([]);
    });

    it('sets the phone properties if it is provided', () => {
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

      const savedUser = await userRepository.findOneOrFail(user.uuid, ['pushTokens']);
      expect(savedUser.uuid).toEqual(user.uuid);
      expect(savedUser.createdAt).toEqual(user.createdAt);
      expect(savedUser.updatedAt).toEqual(user.updatedAt);
      expect(savedUser.email).toEqual(user.email);
      expect(savedUser.password).toEqual(user.password);
      expect(savedUser.did).toBeNull();
      expect(savedUser.phone).toBeNull();
      expect(savedUser.pushTokens.getItems()).toEqual([]);
    });

    it('serializes to json correctly', async () => {
      const user2 = new User(options);
      await userRepository.persistAndFlush(user2);
      orm.em.clear();

      const savedUser = await userRepository.findOneOrFail(user2.uuid, ['pushTokens']);

      const users = await userRepository.findAll();
      console.log('users', users);
      const savedUserObj = wrap(savedUser).toPOJO();
      const expected = {
        uuid: savedUserObj.uuid,
        createdAt: savedUserObj.createdAt,
        updatedAt: savedUserObj.updatedAt,
        email: savedUserObj.email,
        phone: savedUserObj.phone,
        firstName: savedUserObj.firstName,
        did: savedUserObj.did,
        pushTokens: savedUserObj.pushTokens
      };

      expect(wrap(savedUser).toJSON()).toEqual(expected);
    });
  });
});
