import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';
import { isPaginated } from '../../typeguards';

class IssuerDataService extends MikroOrmService<IssuerEntity> {
  async getDefaultIssuerEntity (): Promise<IssuerEntity> {
    try {
      const issuerEntities = await this.find();
      return isPaginated<IssuerEntity>(issuerEntities) ? issuerEntities.data[0] : issuerEntities[0];
    } catch (e) {
      logger.error('IssuerDataService.getDefaultEntity caught an error thrown by this.find', e);
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
