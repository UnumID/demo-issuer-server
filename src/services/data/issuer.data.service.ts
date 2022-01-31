import { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';
import { config } from '../../config';

export class IssuerDataService extends MikroOrmService<IssuerEntity> {
  async getDefaultIssuerEntity (): Promise<IssuerEntity> {
    try {
      return await this.getByDid(config.DEFAULT_ISSUER_DID);
    } catch (e) {
      logger.error('IssuerDataService.getDefaultEntity caught an error thrown by this.getByDid', e);
      throw e;
    }
  }

  /**
   * gets an issuer by did
   * alias for IssuerDataService.get(null, { query: { did: did } })
   * @param {string} did
   * @returns {Promise<IssuerEntity>}
   */
  async getByDid (did: string): Promise<IssuerEntity> {
    try {
      return await this.get(null, { where: { issuerDid: did } });
    } catch (e) {
      logger.error('IssuerDataService.getByDid caught an error thrown by this.get', e);
      throw e;
    }
  }
}

declare module '../../declarations' {
  interface ServiceTypes {
    issuerData: IssuerDataService & ServiceAddons<IssuerEntity>;
  }
}

export default function (app: Application): void {
  app.use('/issuerData', new IssuerDataService({
    Entity: IssuerEntity,
    orm: app.get('orm')
  }));
}
