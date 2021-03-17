import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';
import { NotFound } from '@feathersjs/errors';

import { Application } from '../../declarations';
import { FcmRegistrationToken } from '../../entities/FcmRegistrationToken';
import logger from '../../logger';

export class FcmRegistrationTokenDataService extends MikroOrmService {
  async getByToken (token: string): Promise<FcmRegistrationToken | null> {
    try {
      return await this.get(null, { query: { where: { token } } });
    } catch (e) {
      if (e instanceof NotFound) {
        return null;
      }

      logger.error('FcmRegistrationTokenDataService.getByToken caught an unexpected error thrown by this.get', e);
      throw e;
    }
  }
}

declare module '../../declarations' {
  interface ServiceTypes {
    fcmRegistrationTokenData: FcmRegistrationTokenDataService& ServiceAddons<FcmRegistrationTokenDataService>;
  }
}

export default function (app: Application): void {
  const fcmRegistrationTokenDataService = new FcmRegistrationTokenDataService({
    Entity: FcmRegistrationToken,
    orm: app.get('orm')
  });

  app.use('/fcmRegistrationTokenData', fcmRegistrationTokenDataService);
}
