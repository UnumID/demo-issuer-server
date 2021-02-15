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

      const responseDto = await service.get(dummyIssuerEntity.uuid);
      expect(mockIssuerDataService.get).toBeCalledWith(dummyIssuerEntity.uuid, undefined);
      expect(responseDto).toEqual({ result: dummyIssuerEntity });
    });
  });

  describe('find', () => {
    it('gets all issuers from the data service', async () => {
      mockIssuerDataService.find.mockResolvedValueOnce([dummyIssuerEntity, dummyIssuerEntity2]);
      const responseDto = await service.find();
      expect(mockIssuerDataService.find).toBeCalled();
      expect(responseDto).toEqual({ result: [dummyIssuerEntity, dummyIssuerEntity2] });
    });

    it('gets issuers by params from the data service', async () => {
      mockIssuerDataService.find.mockResolvedValueOnce([dummyIssuerEntity]);
      const params = { where: { email: 'test@unumid.org' } };
      service.find(params);
      expect(mockIssuerDataService.find).toBeCalledWith(params);
    });
  });

  describe('create', () => {
    it('creates a issuer with the issuer data service', async () => {
      mockIssuerDataService.create.mockResolvedValueOnce(dummyIssuerEntity);
      const requestDto = {
        data: dummyIssuerOptions
      };
      const responseDto = await service.create(requestDto);
      expect(mockIssuerDataService.create).toBeCalledWith(requestDto.data, undefined);
      expect(responseDto).toEqual({ result: dummyIssuerEntity });
    });
  });

  describe('patch', () => {
    it('patches a issuer with the issuer data service', async () => {
      const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6IjgzOGJjMzg3LTY1ZmUtNDViMC05ODZmLWRjYzBlODQ0ODI1ZCIsImRpZCI6ImRpZDp1bnVtOjE3NmU1ZGMxLTI0YzEtNGQ2My05OTE0LWQxOTc4ODIwZTc5YyIsImV4cCI6MTYxMzA3MTIyMS40MDIsImlhdCI6MTYxMzE4MjkxN30.RmcwzmU4aAOZAD6Lo9TwByHLLJpYrYwuOBU8MU7g-Js';
      const patchedissuer = {
        ...dummyIssuerEntity,
        authToken
      };
      mockIssuerDataService.patch.mockResolvedValueOnce(patchedissuer);

      const requestDto = {
        data: {
          authToken
        }
      };

      const responseDto = await service.patch(dummyIssuerEntity.uuid, requestDto);
      expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, requestDto.data, undefined);

      const expected = {
        result: patchedissuer
      };
      expect(responseDto).toEqual(expected);
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
      const expected = { result: dummyIssuerEntity };
      expect(responseDto).toEqual(expected);
    });
  });
});
