import { NotFound } from '@feathersjs/errors';
import { Service as MikroOrmService } from 'feathers-mikro-orm';

import generateApp from '../../../src/app';
import { Application } from '../../../src/declarations';
import { IssuerEntity } from '../../../src/entities/Issuer';
import { resetDb } from '../../helpers/resetDb';
import { dummyIssuerEntityOptions } from '../../mocks';

describe('IssuerDataService', () => {
  describe('initializing the service', () => {
    it('registers with the app', async () => {
      const app = await generateApp();
      const service = app.service('issuerData');
      expect(service).toBeDefined();
    });
  });

  describe('using the service', () => {
    let app: Application;
    let service: MikroOrmService<IssuerEntity>;

    beforeEach(async () => {
      app = await generateApp();
      service = app.service('issuerData');
    });

    afterEach(async () => {
      const orm = app.get('orm');
      orm.em.clear();
      await resetDb(orm);
    });

    describe('create', () => {
      it('saves an issuer in the database', async () => {
        const savedIssuer = await service.create(dummyIssuerEntityOptions);
        const retrievedIssuer = await service.get(savedIssuer.uuid);
        expect(retrievedIssuer).toEqual(savedIssuer);
      });
    });

    describe('get', () => {
      let savedIssuer: IssuerEntity;

      beforeEach(async () => {
        savedIssuer = await service.create(dummyIssuerEntityOptions);
      });
      it('gets an issuer from the database by uuid', async () => {
        const retrievedIssuer = await service.get(savedIssuer.uuid);
        expect(retrievedIssuer).toEqual(savedIssuer);
      });

      it('gets an issuer from the db by a query', async () => {
        const retrievedIssuer = await service.get(null, { query: { where: { issuerDid: dummyIssuerEntityOptions.issuerDid } } });
        expect(retrievedIssuer).toEqual(savedIssuer);
      });
    });

    describe('find', () => {
      let savedIssuer1: IssuerEntity;
      let savedIssuer2: IssuerEntity;

      beforeEach(async () => {
        savedIssuer1 = await service.create(dummyIssuerEntityOptions);
        savedIssuer2 = await service.create(dummyIssuerEntityOptions);
      });

      it('gets all issuers from the database', async () => {
        const retrievedIssuers = await service.find();
        expect(retrievedIssuers).toEqual([savedIssuer1, savedIssuer2]);
      });
    });

    describe('remove', () => {
      let savedIssuer: IssuerEntity;

      beforeEach(async () => {
        savedIssuer = await service.create(dummyIssuerEntityOptions);
        await service.create(dummyIssuerEntityOptions);
      });

      it('deletes an issuer', async () => {
        await service.remove(savedIssuer.uuid);
        try {
          await service.get(savedIssuer.uuid);
          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(NotFound);
        }
      });
    });
  });
});
