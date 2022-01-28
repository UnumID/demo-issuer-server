import { Paginated } from '@feathersjs/feathers';
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

export interface PushTokenActuallyCreateOptions {
  user: User,
  value: string;
  provider: PushProvider;
}

export class PushTokenService {
  app: Application;
  dataService: PushTokenDataService;

  constructor (app: Application) {
    this.app = app;
    this.dataService = app.service('pushTokenData');
  }

  async find (): Promise<PushToken[] | Paginated<PushToken>> {
    const pushTokens = await this.dataService.find({ populate: 'users' });

    return pushTokens;
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

  async patchUser (uuid: string, data: Partial<User>): Promise<User> {
    try {
      const patchedUser = await this.app.service('userData').patch(uuid, data);
      return patchedUser as User;
    } catch (e) {
      logger.error('PushTokenService.patchUser caught an error thrown by UserDataService.patch', e);
      throw e;
    }
  }

  async associateUser (token: PushToken, user: User): Promise<PushToken> {
    await user.pushTokens.init();
    user.pushTokens.add(token);
    try {
      await this.patchUser(user.uuid, { pushTokens: user.pushTokens });

      return token;
    } catch (e) {
      logger.error('PushTokenService.associateUser caught an error thrown by this.patchUser', e);
      throw e;
    }
  }

  async actuallyCreate ({ value, user, provider }: PushTokenActuallyCreateOptions): Promise<PushToken> {
    let createdToken: PushToken;
    try {
      createdToken = await this.dataService.create({ value, user, provider });
    } catch (e) {
      logger.error('PushTokenService.actuallyCreate caught an error thrown by this.dataService.create', e);
      throw e;
    }

    try {
      // associate the new token with the user
      // this seems like it shouldn't be necessary, but the dataService.create above does not actually associate them
      await this.associateUser(createdToken, user);
      return createdToken;
    } catch (e) {
      logger.error('PushTokenService.actuallyCreate caught an error thrown by this.associateUser', e);
      throw e;
    }
  }

  async create ({ value, provider, userUuid }: PushTokenCreateOptions): Promise<PushToken> {
    // get existing token with this value, if there is one
    const existingToken = await this.dataService.getByToken(value);

    // get user to associate with token
    const user = await this.getUser(userUuid);

    // if there is no existing token, create one and return it
    if (!existingToken) {
      logger.info('no existing token, creating...');
      try {
        const createdToken = await this.actuallyCreate({ value, user, provider });
        return createdToken;
      } catch (e) {
        logger.error('PushTokenService.create caught an error thrown by this.dataService.create', e);
        throw e;
      }
    }

    // if the user and token are already associated, return the existing token
    await existingToken.users.init();

    if (existingToken.users.getIdentifiers().includes(userUuid)) {
      logger.info('existing token already associated with user, returning existing token');
      return existingToken;
    }

    // if the user and existing token are not already associated, associate them
    logger.info('existing token not associated with user, associating...');
    try {
      await this.associateUser(existingToken, user);

      return existingToken;
    } catch (e) {
      logger.error('PushTokenService.create caught an error thrown by this.dataService.patch', e);
      throw e;
    }
  }
}
