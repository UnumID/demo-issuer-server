import { NotFound } from '@feathersjs/errors';
import { Service as MikroOrmService } from 'feathers-mikro-orm';
import stringify from 'fast-stable-stringify';

import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { CredentialEntity } from '../../../src/entities/Credential';
import { resetDb } from '../../helpers/resetDb';
import { dummyCredentialEntityOptions } from '../../mocks';

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

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('credentialData');
    });

    afterEach(async () => {
      const orm = app.get('orm');
      await resetDb(orm);
    });

    describe('create', () => {
      it('saves a credential in the database', async () => {
        const savedCredential = await service.create(dummyCredentialEntityOptions);
        const retrievedCredential = await service.get(savedCredential.uuid);
        // stringify for comparison because nested dates in json columns are returned as strings
        expect(stringify(retrievedCredential)).toEqual(stringify(savedCredential));
      });
    });

    describe('get', () => {
      let savedCredential: CredentialEntity;

      beforeEach(async () => {
        savedCredential = await service.create(dummyCredentialEntityOptions);
      });

      afterEach(async () => {
        const orm = app.get('orm');
        await resetDb(orm);
      });

      it('gets a credential entity from the database by uuid', async () => {
        const retrievedCredential = await service.get(savedCredential.uuid);
        // stringify for comparison because nested dates in json columns are returned as strings
        expect(stringify(retrievedCredential)).toEqual(stringify(savedCredential));
      });

      it('gets a credential entity from the db by a query', async () => {
        const retrievedCredential = await service.get(null, { query: { where: { credentialId: dummyCredentialEntityOptions.credentialId } } });
        // stringify for comparison because nested dates in json columns are returned as strings
        expect(stringify(retrievedCredential)).toEqual(stringify(savedCredential));
      });
    });

    describe('find', () => {
      let savedCredential1: CredentialEntity;
      let savedCredential2: CredentialEntity;

      beforeEach(async () => {
        savedCredential1 = await service.create(dummyCredentialEntityOptions);
        savedCredential2 = await service.create(dummyCredentialEntityOptions);
      });

      it('gets all credentials from the database', async () => {
        const retrievedCredentials = await service.find();
        // stringify for comparison because nested dates in json columns are returned as strings
        expect(stringify(retrievedCredentials)).toEqual(stringify([savedCredential1, savedCredential2]));
      });

      it('gets all credentials matching a query', async () => {
        const retrievedCredentials = await service.find({ query: { createdAt: savedCredential1.createdAt } });
        // stringify for comparison because nested dates in json columns are returned as strings
        expect(stringify(retrievedCredentials)).toEqual(stringify([savedCredential1]));
      });
    });

    describe('remove', () => {
      let savedCredential: CredentialEntity;

      beforeEach(async () => {
        savedCredential = await service.create(dummyCredentialEntityOptions);
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
