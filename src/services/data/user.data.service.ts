import createService, { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { User } from '../../entities/User';
import hooks from './user.data.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    userData: MikroOrmService & ServiceAddons<User>;
  }
}

export default function (app: Application): void {
  const userDataService = createService({
    Entity: User,
    name: 'User',
    orm: app.get('orm')
  });

  app.use('/userData', userDataService);
  const service = app.service('userData');
  service.hooks(hooks);
}
