import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { PushTokenService } from './pushToken.class';
import { PushToken } from '../../../entities/PushToken';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    pushToken: PushTokenService & ServiceAddons<PushToken>;
  }
}

export default function (app: Application): void {
  app.use('/pushToken', new PushTokenService(app));
}
