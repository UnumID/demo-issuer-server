import { EntityRepository, MikroORM } from '@mikro-orm/core';

import { CredentialEntity, CredentialEntityOptions } from '../../src/entities/Credential';
import mikroOrmConfig from '../../src/mikro-orm.config';
import { resetDb } from '../helpers/resetDb';
import { dummyCredential } from '../mocks';

describe('Credential entity', () => {
  const options: CredentialEntityOptions = {
    credential: dummyCredential
  };

  const credentialEntity = new CredentialEntity(options);

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
      expect(credentialEntity.credential).toEqual(options.credential);
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
      expect(retrievedCredentialEntity.credential).toEqual(credentialEntity.credential);
    });
  });
});
