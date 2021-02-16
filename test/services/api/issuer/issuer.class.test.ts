import { IssuerService } from '../../../../src/services/api/issuer/issuer.class';
import { Application } from '../../../../src/declarations';
import { dummyIssuerEntity, dummyIssuerEntity2, dummyIssuerOptions } from '../../../mocks';

describe('IssuerService class', () => {
  let service: IssuerService;

  const mockIssuerDataService = {
    get: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const app = {
      service: () => {
        return mockIssuerDataService;
      }
    };

    service = new IssuerService({}, app as unknown as Application);
  });

  describe('get', () => {
    it('gets a issuer from the data service by id', async () => {
      mockIssuerDataService.get.mockResolvedValueOnce(dummyIssuerEntity);

      const issuerEntity = await service.get(dummyIssuerEntity.uuid);
      expect(mockIssuerDataService.get).toBeCalledWith(dummyIssuerEntity.uuid, undefined);
      expect(issuerEntity).toEqual(dummyIssuerEntity);
    });
  });

  describe('find', () => {
    it('gets all issuers from the data service', async () => {
      mockIssuerDataService.find.mockResolvedValueOnce([dummyIssuerEntity, dummyIssuerEntity2]);
      const issuerEntities = await service.find();
      expect(mockIssuerDataService.find).toBeCalled();
      expect(issuerEntities).toEqual([dummyIssuerEntity, dummyIssuerEntity2]);
    });

    it('gets issuers by params from the data service', async () => {
      mockIssuerDataService.find.mockResolvedValueOnce([dummyIssuerEntity]);
      const params = { where: { issuerUuid: dummyIssuerEntity.issuerUuid } };
      service.find(params);
      expect(mockIssuerDataService.find).toBeCalledWith(params);
    });
  });

  describe('create', () => {
    it('creates a issuer with the issuer data service', async () => {
      mockIssuerDataService.create.mockResolvedValueOnce(dummyIssuerEntity);
      const issuerEntity = await service.create(dummyIssuerOptions);
      expect(mockIssuerDataService.create).toBeCalledWith(dummyIssuerOptions, undefined);
      expect(issuerEntity).toEqual(dummyIssuerEntity);
    });
  });

  describe('patch', () => {
    it('patches a issuer with the issuer data service', async () => {
      const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjgzOGJjMzg3LTY1ZmUtNDViMC05ODZmLWRjYzBlODQ0ODI1ZCIsImRpZCI6ImRpZDp1bnVtOjE3NmU1ZGMxLTI0YzEtNGQ2My05OTE0LWQxOTc4ODIwZTc5YyIsImV4cCI6MTYxMzA3MTIyMS40MDIsImlhdCI6MTYxMzE4MjkxN30.RmcwzmU4aAOZAD6Lo9TwByHLLJpYrYwuOBU8MU7g-Js';
      const patchedIssuer = {
        ...dummyIssuerEntity,
        authToken
      };
      mockIssuerDataService.patch.mockResolvedValueOnce(patchedIssuer);

      const data = { authToken };

      const response = await service.patch(dummyIssuerEntity.uuid, data);
      expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, data, undefined);
      expect(response).toEqual(patchedIssuer);
    });
  });

  describe('remove', () => {
    it('removes a issuer with the issuer data service', async () => {
      mockIssuerDataService.remove.mockResolvedValueOnce(dummyIssuerEntity);
      await service.remove(dummyIssuerEntity.uuid);
      expect(mockIssuerDataService.remove).toBeCalledWith(dummyIssuerEntity.uuid, undefined);
    });

    it('returns the removed issuer', async () => {
      mockIssuerDataService.remove.mockResolvedValueOnce(dummyIssuerEntity);
      const responseDto = await service.remove(dummyIssuerEntity.uuid);
      expect(responseDto).toEqual(dummyIssuerEntity);
    });
  });
});
