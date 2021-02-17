import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';

class IssuerDataService extends MikroOrmService<IssuerEntity> {
  async getDefaultIssuerEntity (): Promise<IssuerEntity> {
    try {
      const [defaultIssuerEntity] = await this.find();
      return defaultIssuerEntity;
    } catch (e) {
      logger.error('error getting default IssuerEntity', e);
      throw e;
    }
  }
}

declare module '../../declarations' {
  interface ServiceTypes {
    issuerData: MikroOrmService<IssuerEntity> & ServiceAddons<IssuerEntity>;
  }
}

export default function (app: Application): void {
  app.use('/issuerData', new IssuerDataService({
    Entity: IssuerEntity,
    orm: app.get('orm')
  }));
}
