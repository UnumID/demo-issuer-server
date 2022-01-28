import { NullableId, Paginated, Params } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { IssuerEntity, IssuerEntityOptions } from '../../../entities/Issuer';
import logger from '../../../logger';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions { }

export class IssuerService {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: IssuerEntityOptions, params?: Params): Promise<IssuerEntity> {
    const issuerDataService = this.app.service('issuerData');

    try {
      const createdIssuer = await issuerDataService.create(data, params);
      return createdIssuer;
    } catch (e) {
      logger.warn('error in IssuerDataService.create', e);
      throw e;
    }
  }

  async get (uuid: NullableId, params?: Params): Promise<IssuerEntity> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const issuer = await issuerDataService.get(uuid, params);
      return issuer;
    } catch (e) {
      logger.error('error in IssuerDataService.get', e);
      throw e;
    }
  }

  async find (params?: Params): Promise<IssuerEntity[] | Paginated<IssuerEntity>> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const issuers = await issuerDataService.find(params);
      return issuers;
    } catch (e) {
      logger.error('error in IssuerDataService.find', e);
      throw e;
    }
  }

  async patch (uuid: NullableId, data: Partial<IssuerEntity>, params?: Params): Promise<IssuerEntity> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const patchedIssuer = await issuerDataService.patch(uuid, data, params);
      return patchedIssuer as IssuerEntity;
    } catch (e) {
      logger.error('error in IssuerDataService.patch', e);
      throw e;
    }
  }

  async remove (uuid: NullableId, params?: Params): Promise<IssuerEntity | { success: boolean }> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const response = await issuerDataService.remove(uuid, params);
      return response;
    } catch (e) {
      logger.warn('error in IssuerDataService.remove', e);
      throw e;
    }
  }
}
