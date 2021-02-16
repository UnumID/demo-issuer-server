import { EntityRepository, MikroORM } from '@mikro-orm/core';

import { IssuerEntity } from '../../src/entities/Issuer';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyIssuerOptions } from '../mocks';

describe('Issuer entity', () => {
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

    it('sets the privateKey and authToken from options', () => {
      expect(issuer.privateKey).toEqual(dummyIssuerOptions.privateKey);
      expect(issuer.authToken).toEqual(dummyIssuerOptions.authToken);
    });
    it('sets the issuer data from options', () => {
      expect(issuer.issuerUuid).toEqual(dummyIssuerOptions.issuerUuid);
      expect(issuer.issuerDid).toEqual(dummyIssuerOptions.issuerDid);
      expect(issuer.issuerCreatedAt).toEqual(dummyIssuerOptions.issuerCreatedAt);
      expect(issuer.issuerUpdatedAt).toEqual(dummyIssuerOptions.issuerUpdatedAt);
      expect(issuer.issuerName).toEqual(dummyIssuerOptions.issuerName);
      expect(issuer.issuerIsAuthorized).toEqual(dummyIssuerOptions.issuerIsAuthorized);
      expect(issuer.issuerCustomerUuid).toEqual(dummyIssuerOptions.issuerCustomerUuid);
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
      expect(savedIssuer.privateKey).toEqual(issuer.privateKey);
      expect(savedIssuer.authToken).toEqual(issuer.authToken);
      expect(savedIssuer.issuerUuid).toEqual(issuer.issuerUuid);
      expect(savedIssuer.issuerDid).toEqual(issuer.issuerDid);
      expect(savedIssuer.issuerCreatedAt).toEqual(issuer.issuerCreatedAt);
      expect(savedIssuer.issuerUpdatedAt).toEqual(issuer.issuerUpdatedAt);
      expect(savedIssuer.issuerName).toEqual(issuer.issuerName);
      expect(savedIssuer.issuerIsAuthorized).toEqual(issuer.issuerIsAuthorized);
      expect(savedIssuer.issuerCustomerUuid).toEqual(issuer.issuerCustomerUuid);
    });
  });
});
