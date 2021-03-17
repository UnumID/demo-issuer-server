import { Application } from '../../../declarations';
import { FcmRegistrationToken } from '../../../entities/FcmRegistrationToken';
import { User } from '../../../entities/User';
import logger from '../../../logger';
import { FcmRegistrationTokenDataService } from '../../data/fcmRegistrationToken.data.service';

export interface FcmRegistrationTokenCreateOptions {
  userUuid: string;
  token: string;
}

export class FcmRegistrationTokenService {
  app: Application;
  dataService: FcmRegistrationTokenDataService;

  constructor (app: Application) {
    this.app = app;
    this.dataService = app.service('fcmRegistrationTokenData');
  }

  async getUser (uuid: string): Promise<User> {
    try {
      const user = await this.app.service('userData').get(uuid);
      return user;
    } catch (e) {
      logger.error('FcmRegistrationTokenService.getUser caught an error thrown by UserDataService.get', e);
      throw e;
    }
  }

  async associateUser (uuid: string, userUuid: string): Promise<FcmRegistrationToken> {
    const user = await this.getUser(userUuid);
    try {
      const updatedFcmRegistrationToken = await this.dataService.patch(uuid, { user });
      return updatedFcmRegistrationToken;
    } catch (e) {
      logger.error('FcmRegistrationTokenService.associateUser caught an error thrown by this.dataService.patch', e);
      throw e;
    }
  }

  async actuallyCreate ({ token, userUuid }: FcmRegistrationTokenCreateOptions): Promise<FcmRegistrationToken> {
    const user = await this.getUser(userUuid);
    try {
      const fcmRegistrationToken = await this.dataService.create({ token, user });
      return fcmRegistrationToken;
    } catch (e) {
      logger.error('FcmRegistrationTokenService.actuallyCreate caught an error thrown by this.dataService.create', e);
      throw e;
    }
  }

  async create ({ token, userUuid }: FcmRegistrationTokenCreateOptions): Promise<FcmRegistrationToken> {
    const existingToken = await this.dataService.getByToken(token);

    if (!existingToken) {
      return this.actuallyCreate({ token, userUuid });
    }

    if (existingToken.user.uuid === userUuid) {
      return existingToken;
    } else {
      return this.associateUser(existingToken.uuid, userUuid);
    }
  }
}
