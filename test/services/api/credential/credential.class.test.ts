import { CredentialService } from '../../../../src/services/api/credential/credential.class';
import { Application } from '../../../../src/declarations';
import { dummyCredentialEntity, dummyCredentialEntity2, dummyCredentialEntityOptions } from '../../../mocks';

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
      expect(responseDto).toEqual({ result: dummyCredentialEntity });
    });
  });

  describe('find', () => {
    it('gets all credentials from the data service', async () => {
      mockCredentialDataService.find.mockResolvedValueOnce([dummyCredentialEntity, dummyCredentialEntity2]);
      const responseDto = await service.find();
      expect(mockCredentialDataService.find).toBeCalled();
      expect(responseDto).toEqual({ result: [dummyCredentialEntity, dummyCredentialEntity2] });
    });

    it('gets credentials by params from the data service', async () => {
      mockCredentialDataService.find.mockResolvedValueOnce([dummyCredentialEntity]);
      const params = { where: { email: 'test@unumid.org' } };
      service.find(params);
      expect(mockCredentialDataService.find).toBeCalledWith(params);
    });
  });

  describe('create', () => {
    it('creates a credential with the credential data service', async () => {
      mockCredentialDataService.create.mockResolvedValueOnce(dummyCredentialEntity);
      const requestDto = {
        data: dummyCredentialEntityOptions
      };
      const responseDto = await service.create(requestDto);
      expect(mockCredentialDataService.create).toBeCalledWith(requestDto.data, undefined);
      expect(responseDto).toEqual({ result: dummyCredentialEntity });
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
      const expected = { result: dummyCredentialEntity };
      expect(responseDto).toEqual(expected);
    });
  });
});
