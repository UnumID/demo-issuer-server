import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { FcmRegistrationTokenService } from './fcmRegistrationToken.class';
import { FcmRegistrationToken } from '../../../entities/FcmRegistrationToken';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    fcmRegistrationToken: FcmRegistrationTokenService & ServiceAddons<FcmRegistrationToken>;
  }
}

export default function (app: Application): void {
  app.use('/fcmRegistrationToken', new FcmRegistrationTokenService(app));
}
