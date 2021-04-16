import { GeneralError } from '@feathersjs/errors';
import { when } from 'jest-when';

import { PushTokenCreateOptions, PushTokenService } from '../../../../src/services/api/pushToken/pushToken.class';
import { dummyUser, dummyUser2 } from '../../../mocks';
import { Application } from '../../../../src/declarations';
import logger from '../../../../src/logger';
import { PushToken } from '../../../../src/entities/PushToken';

jest.mock('../../../../src/logger');
const dummyPushToken = new PushToken({ value: 'dummy token', user: dummyUser, provider: 'FCM' });

describe('PushTokenService class', () => {
  describe('create', () => {
    const mockGetByToken = jest.fn();
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    let service: PushTokenService;

    beforeEach(() => {
      when(mockService)
        .calledWith('pushTokenData').mockReturnValue({ getByToken: mockGetByToken })
        .calledWith('userData').mockReturnValue({ get: mockGet });
      service = new PushTokenService(app);
    });

    it('creates a new pushToken if one does not exist', async () => {
      const options: PushTokenCreateOptions = {
        value: 'dummy token',
        userUuid: dummyUser.uuid,
        provider: 'FCM'
      };

      jest.spyOn(service, 'actuallyCreate').mockResolvedValueOnce(dummyPushToken);
      mockGetByToken.mockResolvedValue(null);

      const pushToken = await service.create(options);

      expect(service.actuallyCreate).toBeCalled();
      expect(pushToken).toEqual(dummyPushToken);
    });

    it('returns the pushToken if it exists and the user does not need to be updated', async () => {
      const options: PushTokenCreateOptions = {
        value: 'dummy token',
        userUuid: dummyUser.uuid,
        provider: 'FCM'
      };

      jest.spyOn(service, 'actuallyCreate');
      mockGetByToken.mockResolvedValueOnce(dummyPushToken);

      const pushToken = await service.create(options);

      expect(service.actuallyCreate).not.toBeCalled();
      expect(pushToken).toEqual(dummyPushToken);
    });

    it('updates the existing pushToken if it is associated with a different user', async () => {
      const options: PushTokenCreateOptions = {
        value: 'dummy token',
        userUuid: dummyUser2.uuid,
        provider: 'FCM'
      };

      jest.spyOn(service, 'associateUser').mockResolvedValueOnce({ ...dummyPushToken, user: dummyUser2 });
      mockGetByToken.mockResolvedValueOnce(dummyPushToken);

      const pushToken = await service.create(options);

      expect(service.associateUser).toBeCalled();
      expect(pushToken).toEqual({ ...dummyPushToken, user: dummyUser2 });
    });
  });

  describe('getUser', () => {
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const dummyUserDataService = { get: mockGet };
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    const service = new PushTokenService(app);

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
    const mockPatch = jest.fn(() => Promise.resolve(dummyPushToken));
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    let service: PushTokenService;

    beforeEach(() => {
      when(mockService)
        .calledWith('pushTokenData').mockReturnValue({ patch: mockPatch })
        .calledWith('userData').mockReturnValue({ get: mockGet });
      service = new PushTokenService(app);
    });

    it('patches the PushToken to associate it with the user', async () => {
      const patchedPushToken = await service.associateUser(dummyPushToken.uuid, dummyUser.uuid);
      expect(mockService).toBeCalledWith('pushTokenData');
      expect(mockPatch).toBeCalledWith(dummyPushToken.uuid, { user: dummyUser });
      expect(patchedPushToken).toEqual(dummyPushToken);
    });

    it('logs and re-throws caught errors', async () => {
      const err = new GeneralError('error patching pushToken');
      mockPatch.mockRejectedValueOnce(err);

      try {
        await service.associateUser(dummyPushToken.uuid, dummyUser.uuid);
        fail();
      } catch (e) {
        expect(logger.error).toBeCalled();
        expect(e).toEqual(err);
      }
    });
  });

  describe('actuallyCreate', () => {
    const mockCreate = jest.fn(() => Promise.resolve(dummyPushToken));
    const mockGet = jest.fn(() => Promise.resolve(dummyUser));
    const mockService = jest.fn();
    const app = { service: mockService } as unknown as Application;
    let service: PushTokenService;

    beforeEach(() => {
      when(mockService)
        .calledWith('pushTokenData').mockReturnValue({ create: mockCreate })
        .calledWith('userData').mockReturnValue({ get: mockGet });
      service = new PushTokenService(app);
    });
    it('creates a PushToken using the data service', async () => {
      const pushToken = await service.actuallyCreate({ value: 'dummy token', userUuid: dummyUser.uuid, provider: 'FCM' });
      expect(pushToken).toEqual(dummyPushToken);
      expect(mockCreate).toBeCalledWith({ value: 'dummy token', user: dummyUser, provider: 'FCM' });
    });

    it('logs and re-throws caught errors', async () => {
      const err = new GeneralError('error creating pushToken');
      mockCreate.mockRejectedValueOnce(err);

      try {
        await service.actuallyCreate({ value: 'dummy token', userUuid: dummyUser.uuid, provider: 'FCM' });
        fail();
      } catch (e) {
        expect(logger.error).toBeCalled();
        expect(e).toEqual(err);
      }
    });
  });
});
