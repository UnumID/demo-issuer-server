import { CredentialService } from '../../../../src/services/api/credential/credential.class';
import { Application } from '../../../../src/declarations';
import { dummyCredentialEntityV3 as dummyCredentialEntity, dummyCredentialEntity2V3 as dummyCredentialEntity2, dummyCredentialEntityOptionsV3 as dummyCredentialEntityOptions } from '../../../mocks';

describe('CredentialService class', () => {
  let service: CredentialService;

  const mockCredentialDataService = {
    get: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const app = {
      service: () => {
        return mockCredentialDataService;
      }
    };

    service = new CredentialService({}, app as unknown as Application);
  });

  describe('get', () => {
    it('gets a credential from the data service by id', async () => {
      mockCredentialDataService.get.mockResolvedValueOnce(dummyCredentialEntity);

      const responseDto = await service.get(dummyCredentialEntity.uuid);
      expect(mockCredentialDataService.get).toBeCalledWith(dummyCredentialEntity.uuid, undefined);
      expect(responseDto).toEqual(dummyCredentialEntity);
    });
  });

  describe('find', () => {
    it('gets all credentials from the data service', async () => {
      mockCredentialDataService.find.mockResolvedValueOnce([dummyCredentialEntity, dummyCredentialEntity2]);
      const responseDto = await service.find();
      expect(mockCredentialDataService.find).toBeCalled();
      expect(responseDto).toEqual([dummyCredentialEntity, dummyCredentialEntity2]);
    });

    it('gets credentials by params from the data service', async () => {
      mockCredentialDataService.find.mockResolvedValueOnce([dummyCredentialEntity]);
      const params = { where: { credentialId: dummyCredentialEntity.credentialId } };
      service.find(params);
      expect(mockCredentialDataService.find).toBeCalledWith(params);
    });
  });

  describe('create', () => {
    it('creates a credential with the credential data service', async () => {
      mockCredentialDataService.create.mockResolvedValueOnce(dummyCredentialEntity);
      const responseDto = await service.create(dummyCredentialEntityOptions);
      expect(mockCredentialDataService.create).toBeCalledWith(dummyCredentialEntityOptions, undefined);
      expect(responseDto).toEqual(dummyCredentialEntity);
    });
  });

  describe('remove', () => {
    it('removes a credential with the credential data service', async () => {
      mockCredentialDataService.remove.mockResolvedValueOnce(dummyCredentialEntity);
      await service.remove(dummyCredentialEntity.uuid);
      expect(mockCredentialDataService.remove).toBeCalledWith(dummyCredentialEntity.uuid, undefined);
    });

    it('returns the removed credential', async () => {
      mockCredentialDataService.remove.mockResolvedValueOnce(dummyCredentialEntity);
      const responseDto = await service.remove(dummyCredentialEntity.uuid);
      expect(responseDto).toEqual(dummyCredentialEntity);
    });
  });
});
