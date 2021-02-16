import { NullableId, Params } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { User } from '../../../entities/User';
import logger from '../../../logger';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions { }

export class UserService {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: Partial<User>, params?: Params): Promise<User> {
    const userDataService = this.app.service('userData');

    try {
      const createdUser = await userDataService.create(data, params);
      return createdUser;
    } catch (e) {
      logger.warn('error in UserDataService.create', e);
      throw e;
    }
  }

  async get (uuid: NullableId, params?: Params): Promise<User> {
    const userDataService = this.app.service('userData');
    try {
      const user = await userDataService.get(uuid, params);
      return user;
    } catch (e) {
      logger.error('error in UserDataService.get', e);
      throw e;
    }
  }

  async find (params?: Params): Promise<User[]> {
    const userDataService = this.app.service('userData');
    try {
      const users = await userDataService.find(params);
      return users;
    } catch (e) {
      logger.error('error in UserDataService.find', e);
      throw e;
    }
  }

  async patch (uuid: NullableId, data: Partial<User>, params?: Params): Promise<User> {
    const userDataService = this.app.service('userData');
    try {
      const patchedUser = await userDataService.patch(uuid, data, params);
      return patchedUser;
    } catch (e) {
      logger.error('error in UserDataService.patch', e);
      throw e;
    }
  }

  async remove (uuid: NullableId, params?: Params): Promise<User> {
    const userDataService = this.app.service('userData');
    try {
      const response = await userDataService.remove(uuid, params);
      return response;
    } catch (e) {
      logger.warn('error in UserService.remove', e);
      throw e;
    }
  }
}
