import { EntityRepository, MikroORM } from '@mikro-orm/core';

import { IssuerEntity } from '../../src/entities/Issuer';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyIssuerEntityOptions } from '../mocks';

describe('Issuer entity', () => {
  const issuer = new IssuerEntity(dummyIssuerEntityOptions);
  describe('constructor behavior', () => {
    it('generates a uuid', () => {
      expect(issuer.uuid).toBeDefined();
    });

    it('generates createdAt and updatedAt dates', () => {
      expect(issuer.createdAt).toBeDefined();
      expect(issuer.updatedAt).toBeDefined();
      expect(issuer.updatedAt).toEqual(issuer.createdAt);
    });

    it('sets the apiKey, privateKey, authToken from options', () => {
      expect(issuer.apiKey).toEqual(dummyIssuerEntityOptions.apiKey);
      expect(issuer.privateKey).toEqual(dummyIssuerEntityOptions.privateKey);
      expect(issuer.authToken).toEqual(dummyIssuerEntityOptions.authToken);
    });
    it('sets the issuer data from options', () => {
      expect(issuer.issuerUuid).toEqual(dummyIssuerEntityOptions.issuerUuid);
      expect(issuer.issuerDid).toEqual(dummyIssuerEntityOptions.issuerDid);
      expect(issuer.issuerCreatedAt).toEqual(dummyIssuerEntityOptions.issuerCreatedAt);
      expect(issuer.issuerUpdatedAt).toEqual(dummyIssuerEntityOptions.issuerUpdatedAt);
      expect(issuer.issuerName).toEqual(dummyIssuerEntityOptions.issuerName);
      expect(issuer.issuerIsAuthorized).toEqual(dummyIssuerEntityOptions.issuerIsAuthorized);
      expect(issuer.issuerCustomerUuid).toEqual(dummyIssuerEntityOptions.issuerCustomerUuid);
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
