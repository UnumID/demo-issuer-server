import createService, { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { FcmRegistrationToken } from '../../entities/FcmRegistrationToken';

declare module '../../declarations' {
  interface ServiceTypes {
    fcmRegistrationTokenData: MikroOrmService<FcmRegistrationToken> & ServiceAddons<FcmRegistrationToken>;
  }
}

export default function (app: Application): void {
  const fcmRegistrationTokenDataService = createService({
    Entity: FcmRegistrationToken,
    orm: app.get('orm')
  });

  app.use('/fcmRegistrationTokenData', fcmRegistrationTokenDataService);
}
