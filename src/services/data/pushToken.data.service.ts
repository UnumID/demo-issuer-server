import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';
import { NotFound } from '@feathersjs/errors';

import { Application } from '../../declarations';
import { PushToken } from '../../entities/PushToken';
import logger from '../../logger';

export class PushTokenDataService extends MikroOrmService {
  async getByToken (value: string): Promise<PushToken | null> {
    try {
      return await this.get(null, { query: { where: { value } } });
    } catch (e) {
      if (e instanceof NotFound) {
        return null;
      }

      logger.error('PushTokenDataService.getByToken caught an unexpected error thrown by this.get', e);
      throw e;
    }
  }
}

declare module '../../declarations' {
  interface ServiceTypes {
    pushTokenData: PushTokenDataService& ServiceAddons<PushTokenDataService>;
  }
}

export default function (app: Application): void {
  const pushTokenDataService = new PushTokenDataService({
    Entity: PushToken,
    orm: app.get('orm')
  });

  app.use('/pushTokenData', pushTokenDataService);
}
