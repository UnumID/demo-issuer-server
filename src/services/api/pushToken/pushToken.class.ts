import { PushProvider } from '@unumid/types';

import { Application } from '../../../declarations';
import { PushToken } from '../../../entities/PushToken';
import { User } from '../../../entities/User';
import logger from '../../../logger';
import { PushTokenDataService } from '../../data/pushToken.data.service';

export interface PushTokenCreateOptions {
  userUuid: string;
  value: string;
  provider: PushProvider
}

export class PushTokenService {
  app: Application;
  dataService: PushTokenDataService;

  constructor (app: Application) {
    this.app = app;
    this.dataService = app.service('pushTokenData');
  }

  async getUser (uuid: string): Promise<User> {
    try {
      const user = await this.app.service('userData').get(uuid);
      return user;
    } catch (e) {
      logger.error('PushTokenService.getUser caught an error thrown by UserDataService.get', e);
      throw e;
    }
  }

  async associateUser (uuid: string, userUuid: string): Promise<PushToken> {
    const user = await this.getUser(userUuid);
    try {
      const updatedFcmRegistrationToken = await this.dataService.patch(uuid, { user });
      return updatedFcmRegistrationToken;
    } catch (e) {
      logger.error('PushTokenService.associateUser caught an error thrown by this.dataService.patch', e);
      throw e;
    }
  }

  async actuallyCreate ({ value, userUuid, provider }: PushTokenCreateOptions): Promise<PushToken> {
    const user = await this.getUser(userUuid);
    try {
      const fcmRegistrationToken = await this.dataService.create({ value, user, provider });
      return fcmRegistrationToken;
    } catch (e) {
      logger.error('PushTokenService.actuallyCreate caught an error thrown by this.dataService.create', e);
      throw e;
    }
  }

  async create ({ value, provider, userUuid }: PushTokenCreateOptions): Promise<PushToken> {
    const existingToken = await this.dataService.getByToken(value);

    if (!existingToken) {
      return this.actuallyCreate({ value, userUuid, provider });
    }

    if (existingToken.user.uuid === userUuid) {
      return existingToken;
    } else {
      return this.associateUser(existingToken.uuid, userUuid);
    }
  }
}
