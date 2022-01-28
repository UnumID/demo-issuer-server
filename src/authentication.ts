import { Params, Query, ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationResult, AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';

import { Application } from './declarations';
import { User } from './entities/User';
import { v4 } from 'uuid';
import logger from './logger';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

/**
 * Customized LocalStrategy to inject the userCode at time of login
 * ref: https://docs.feathersjs.com/api/authentication/local.html#customization
 */
class MyLocalStrategy extends LocalStrategy {
  app: Application;
  constructor (app: Application) {
    super();
    this.app = app;
  }

  async getEntity (authenticatedUser: User, params: Params) {
    // create and persist a userCode on the User entity before returning it
    const userDataService = this.app.service('userData');
    try {
      const patchedUser = await userDataService.patch(authenticatedUser.uuid, { userCode: v4() }, { ...params, populate: true });
      return patchedUser;
    } catch (e) {
      logger.error(`error in login's UserDataService.patch. ${e}`);
      throw e;
    }
  }
}

export default function (app: Application): void {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new MyLocalStrategy(app));

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}
