import { NotFound } from '@feathersjs/errors';
import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { v4 } from 'uuid';

import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { CredentialEntity } from '../../../src/entities/Credential';
import { resetDb } from '../../helpers/resetDb';
import { dummyCredential } from '../../mocks';

describe('CredentialDataService', () => {
  describe('initializing the service', () => {
    it('registers with the app', async () => {
      const app = await generateApp();
      const service = app.service('credentialData');
      expect(service).toBeDefined();
    });
  });

  describe('using the service', () => {
    let app: Application;
    let service: MikroOrmService;

    const options = {
      credential: dummyCredential
    };

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('credentialData');
    });

    afterEach(async () => {
      const orm = app.get('orm');
      orm.em.clear();
      await resetDb(orm);
    });

    describe('create', () => {
      it('saves a credential in the database', async () => {
        const savedCredential = await service.create(options);
        const retrievedCredential = await service.get(savedCredential.uuid);
        expect(retrievedCredential).toEqual(savedCredential);
      });
    });

    describe('get', () => {
      let savedCredential: CredentialEntity;

      beforeEach(async () => {
        savedCredential = await service.create(options);
      });

      afterEach(async () => {
        const orm = app.get('orm');
        orm.em.clear();
        await resetDb(orm);
      });

      it('gets a credential entity from the database by uuid', async () => {
        const retrievedCredential = await service.get(savedCredential.uuid);
        expect(retrievedCredential).toEqual(savedCredential);
      });

      it('gets a credential entity from the db by a query', async () => {
        const retrievedCredential = await service.get(null, { query: { where: { credential_id: options.credential.id } } });
        expect(retrievedCredential).toEqual(savedCredential);
      });
    });

    describe('find', () => {
      let savedCredential1: CredentialEntity;
      let savedCredential2: CredentialEntity;

      beforeEach(async () => {
        savedCredential1 = await service.create(options);
        savedCredential2 = await service.create(options);
      });

      it('gets all credentials from the database', async () => {
        const retrievedCredentials = await service.find();
        expect(retrievedCredentials).toEqual([savedCredential1, savedCredential2]);
      });

      it('gets all credentials matching a query', async () => {
        const retrievedCredentials = await service.find({ query: { createdAt: savedCredential1.createdAt } });
        expect(retrievedCredentials).toEqual([savedCredential1]);
      });
    });

    describe('remove', () => {
      let savedCredential: CredentialEntity;

      beforeEach(async () => {
        savedCredential = await service.create(options);
      });

      it('deletes a credential', async () => {
        await service.remove(savedCredential.uuid);
        try {
          await service.get(savedCredential.uuid);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(NotFound);
        }
      });
    });
  });
});
