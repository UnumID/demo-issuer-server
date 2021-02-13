import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { v4 } from 'uuid';

import { IssuerEntity } from '../../src/entities/Issuer';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyIssuerOptions } from '../mocks';

describe('Issuer entity', () => {
  const now = new Date().toISOString();

  const issuer = new IssuerEntity(dummyIssuerOptions);
  describe('constructor behavior', () => {
    it('generates a uuid', () => {
      expect(issuer.uuid).toBeDefined();
    });

    it('generates createdAt and updatedAt dates', () => {
      expect(issuer.createdAt).toBeDefined();
      expect(issuer.updatedAt).toBeDefined();
      expect(issuer.updatedAt).toEqual(issuer.createdAt);
    });

    it('sets the issuer data from options', () => {
      expect(issuer.issuer).toEqual(dummyIssuerOptions.issuer);
    });
  });

  describe('storage behavior', () => {
    let orm: MikroORM;
    let issuerRepository: EntityRepository<IssuerEntity>;

    beforeEach(async () => {
      orm = await MikroORM.init(mikroOrmConfig);
      issuerRepository = orm.em.getRepository(IssuerEntity);
    });

    afterEach(async () => {
      await resetDb(orm);
    });

    it('saves the issuer in the database', async () => {
      await issuerRepository.persistAndFlush(issuer);
      orm.em.clear();

      const savedIssuer = await issuerRepository.findOneOrFail(issuer.uuid);
      expect(savedIssuer.uuid).toEqual(issuer.uuid);
      expect(savedIssuer.createdAt).toEqual(issuer.createdAt);
      expect(savedIssuer.updatedAt).toEqual(issuer.updatedAt);
      expect(savedIssuer.issuer).toEqual(issuer.issuer);
    });
  });
});
