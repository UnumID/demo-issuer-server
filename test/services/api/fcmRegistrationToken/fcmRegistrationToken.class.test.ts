import { GeneralError } from '@feathersjs/errors';
import { when } from 'jest-when';

import { FcmRegistrationTokenService } from '../../../../src/services/api/fcmRegistrationToken/fcmRegistrationToken.class';
import { dummyUser, dummyUser2 } from '../../../mocks';
import { Application } from '../../../../src/declarations';
import logger from '../../../../src/logger';
import { FcmRegistrationToken } from '../../../../src/entities/FcmRegistrationToken';

jest.mock('../../../../src/logger');
const dummyFcmRegistrationToken = new FcmRegistrationToken({ token: 'dummy token', user: dummyUser });

describe('FcmRegistrationTokenService class', () => {
  describe('create', () => {
    const mockGetByToken = jest.fn();
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    let service: FcmRegistrationTokenService;

    beforeEach(() => {
      when(mockService)
        .calledWith('fcmRegistrationTokenData').mockReturnValue({ getByToken: mockGetByToken })
        .calledWith('userData').mockReturnValue({ get: mockGet });
      service = new FcmRegistrationTokenService(app);
    });

    it('creates a new fcmRegistrationToken if one does not exist', async () => {
      const options = {
        token: 'dummy token',
        userUuid: dummyUser.uuid
      };

      jest.spyOn(service, 'actuallyCreate').mockResolvedValueOnce(dummyFcmRegistrationToken);
      mockGetByToken.mockResolvedValue(null);

      const fcmRegistrationToken = await service.create(options);

      expect(service.actuallyCreate).toBeCalled();
      expect(fcmRegistrationToken).toEqual(dummyFcmRegistrationToken);
    });

    it('returns the fcmRegistrationToken if it exists and the user does not need to be updated', async () => {
      const options = {
        token: 'dummy token',
        userUuid: dummyUser.uuid
      };

      jest.spyOn(service, 'actuallyCreate');
      mockGetByToken.mockResolvedValueOnce(dummyFcmRegistrationToken);

      const fcmRegistrationToken = await service.create(options);

      expect(service.actuallyCreate).not.toBeCalled();
      expect(fcmRegistrationToken).toEqual(dummyFcmRegistrationToken);
    });

    it('updates the existing fcmRegistrationToken if it is associated with a different user', async () => {
      const options = {
        token: 'dummy token',
        userUuid: dummyUser2.uuid
      };

      jest.spyOn(service, 'associateUser').mockResolvedValueOnce({ ...dummyFcmRegistrationToken, user: dummyUser2 });
      mockGetByToken.mockResolvedValueOnce(dummyFcmRegistrationToken);

      const fcmRegistrationToken = await service.create(options);

      expect(service.associateUser).toBeCalled();
      expect(fcmRegistrationToken).toEqual({ ...dummyFcmRegistrationToken, user: dummyUser2 });
    });
  });

  describe('getUser', () => {
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const dummyUserDataService = { get: mockGet };
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    const service = new FcmRegistrationTokenService(app);

    beforeEach(() => {
      when(mockService).calledWith('userData').mockReturnValue(dummyUserDataService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('gets a user by uuid', async () => {
      const user = await service.getUser(dummyUser.uuid);
      expect(mockService).toBeCalledWith('userData');
      expect(mockGet).toBeCalledWith(dummyUser.uuid);
      expect(user).toEqual(dummyUser);
    });

    it('logs and re-throws caught errors', async () => {
      const err = new GeneralError('error getting user');
      mockGet.mockRejectedValueOnce(err);

      try {
        await service.getUser(dummyUser.uuid);
        fail();
      } catch (e) {
        expect(logger.error).toBeCalled();
        expect(e).toEqual(err);
      }
    });
  });

  describe('associateUser', () => {
    const mockPatch = jest.fn(() => Promise.resolve(dummyFcmRegistrationToken));
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    let service: FcmRegistrationTokenService;

    beforeEach(() => {
      when(mockService)
        .calledWith('fcmRegistrationTokenData').mockReturnValue({ patch: mockPatch })
        .calledWith('userData').mockReturnValue({ get: mockGet });
      service = new FcmRegistrationTokenService(app);
    });

    it('patches the FcmRegistrationToken to associate it with the user', async () => {
      const patchedFcmRegistrationToken = await service.associateUser(dummyFcmRegistrationToken.uuid, dummyUser.uuid);
      expect(mockService).toBeCalledWith('fcmRegistrationTokenData');
      expect(mockPatch).toBeCalledWith(dummyFcmRegistrationToken.uuid, { user: dummyUser });
      expect(patchedFcmRegistrationToken).toEqual(dummyFcmRegistrationToken);
    });

    it('logs and re-throws caught errors', async () => {
      const err = new GeneralError('error patching fcmRegistrationToken');
      mockPatch.mockRejectedValueOnce(err);

      try {
        await service.associateUser(dummyFcmRegistrationToken.uuid, dummyUser.uuid);
        fail();
      } catch (e) {
        expect(logger.error).toBeCalled();
        expect(e).toEqual(err);
      }
    });
  });

  describe('actuallyCreate', () => {
    const mockCreate = jest.fn(() => Promise.resolve(dummyFcmRegistrationToken));
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    let service: FcmRegistrationTokenService;

    beforeEach(() => {
      when(mockService)
        .calledWith('fcmRegistrationTokenData').mockReturnValue({ create: mockCreate })
        .calledWith('userData').mockReturnValue({ get: mockGet });
      service = new FcmRegistrationTokenService(app);
    });
    it('creates an FcmRegistrationToken using the data service', async () => {
      const fcmRegistrationToken = await service.actuallyCreate({ token: 'dummy token', userUuid: dummyUser.uuid });
      expect(fcmRegistrationToken).toEqual(dummyFcmRegistrationToken);
      expect(mockCreate).toBeCalledWith({ token: 'dummy token', user: dummyUser });
    });

    it('logs and re-throws caught errors', async () => {
      const err = new GeneralError('error creating fcmRegistrationToken');
      mockCreate.mockRejectedValueOnce(err);

      try {
        await service.actuallyCreate({ token: 'dummy token', userUuid: dummyUser.uuid });
        fail();
      } catch (e) {
        expect(logger.error).toBeCalled();
        expect(e).toEqual(err);
      }
    });
  });
});
