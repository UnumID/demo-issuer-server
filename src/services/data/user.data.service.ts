import createService, { Service as MikroOrmService } from 'feathers-mikro-orm';
import { NullableId, Params, ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { User } from '../../entities/User';
import hooks from './user.data.hooks';
import logger from '../../logger';

declare module '../../declarations' {
  interface ServiceTypes {
    userData: MikroOrmService<User> & ServiceAddons<User>;
  }
}

class UserDataService extends MikroOrmService<User> {
  async get (id: NullableId, params?: Params): Promise<User> {
    logger.info(`\nUserDataService.get id: ${id}\n`);
    logger.info(`\nUserDataService.get params: ${params && JSON.stringify(params)}\n`);

    return super.get(id, params);
  }
}

export default function (app: Application): void {
  const userDataService = new UserDataService({
    Entity: User,
    orm: app.get('orm')
  });

  app.use('/userData', userDataService);
  const service = app.service('userData');
  service.hooks(hooks);
}
