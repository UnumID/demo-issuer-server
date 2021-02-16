import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { UserService, UserResponseDto, UserListResponseDto } from './user.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    user: UserService & ServiceAddons<UserResponseDto | UserListResponseDto>;
  }
}

export default function (app: Application): void {
  app.use('/user', new UserService({}, app));
}
