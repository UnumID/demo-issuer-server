import { EntityRepository, MikroORM } from '@mikro-orm/core';

import { CredentialEntity } from '../../src/entities/Credential';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyCredentialEntityOptionsV3 as dummyCredentialEntityOptions } from '../mocks';

describe('Credential entity', () => {
  const credentialEntity = new CredentialEntity(dummyCredentialEntityOptions);

  describe('constructor behavior', () => {
    it('generates a uuid', () => {
      expect(credentialEntity.uuid).toBeDefined();
    });

    it('generates createdAt and updatedAt dates', () => {
      expect(credentialEntity.createdAt).toBeDefined();
      expect(credentialEntity.updatedAt).toBeDefined();
      expect(credentialEntity.updatedAt).toEqual(credentialEntity.createdAt);
    });

    it('sets the credential data from options', () => {
      expect(credentialEntity.credentialContext).toEqual(dummyCredentialEntityOptions.credentialContext);
      expect(credentialEntity.credentialId).toEqual(dummyCredentialEntityOptions.credentialId);
      expect(credentialEntity.credentialCredentialStatus).toEqual(dummyCredentialEntityOptions.credentialCredentialStatus);
      expect(credentialEntity.credentialCredentialSubject).toEqual(dummyCredentialEntityOptions.credentialCredentialSubject);
      expect(credentialEntity.credentialIssuer).toEqual(dummyCredentialEntityOptions.credentialIssuer);
      expect(credentialEntity.credentialType).toEqual(dummyCredentialEntityOptions.credentialType);
      expect(credentialEntity.credentialIssuanceDate).toEqual(dummyCredentialEntityOptions.credentialIssuanceDate);
      expect(credentialEntity.credentialExpirationDate).toEqual(dummyCredentialEntityOptions.credentialExpirationDate);
      expect(credentialEntity.credentialProof).toEqual(dummyCredentialEntityOptions.credentialProof);
    });
  });

  describe('storage behavior', () => {
    let orm: MikroORM;
    let credentialRepository: EntityRepository<CredentialEntity>;

    beforeEach(async () => {
      orm = await MikroORM.init(mikroOrmConfig);
      credentialRepository = orm.em.getRepository(CredentialEntity);
    });

    afterEach(async () => {
      await resetDb(orm);
    });

    it('saves the credential in the database', async () => {
      await credentialRepository.persistAndFlush(credentialEntity);
      orm.em.clear();

      const retrievedCredentialEntity = await credentialRepository.findOneOrFail(credentialEntity.uuid);
      expect(retrievedCredentialEntity.uuid).toEqual(credentialEntity.uuid);
      expect(retrievedCredentialEntity.createdAt).toEqual(credentialEntity.createdAt);
      expect(retrievedCredentialEntity.updatedAt).toEqual(credentialEntity.updatedAt);
      expect(retrievedCredentialEntity.credentialContext).toEqual(credentialEntity.credentialContext);
      expect(retrievedCredentialEntity.credentialId).toEqual(credentialEntity.credentialId);
      expect(retrievedCredentialEntity.credentialCredentialStatus).toEqual(credentialEntity.credentialCredentialStatus);
      expect(retrievedCredentialEntity.credentialCredentialSubject).toEqual(credentialEntity.credentialCredentialSubject);
      expect(retrievedCredentialEntity.credentialIssuer).toEqual(credentialEntity.credentialIssuer);
      expect(retrievedCredentialEntity.credentialType).toEqual(credentialEntity.credentialType);
      expect(retrievedCredentialEntity.credentialIssuanceDate).toEqual(credentialEntity.credentialIssuanceDate);
      expect(retrievedCredentialEntity.credentialExpirationDate).toEqual(credentialEntity.credentialExpirationDate);
      expect({ ...retrievedCredentialEntity.credentialProof, created: new Date(retrievedCredentialEntity.credentialProof.created) }).toEqual({ ...credentialEntity.credentialProof, created: new Date(credentialEntity.credentialProof.created) });
    });
  });
});
