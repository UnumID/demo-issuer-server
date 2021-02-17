import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { UserService } from './user.class';
import { User } from '../../../entities/User';
import { hooks } from './user.hooks';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    user: UserService & ServiceAddons<User>;
  }
}

export default function (app: Application): void {
  app.use('/user', new UserService({}, app));
  const service = app.service('user');
  service.hooks(hooks);
}
