import { NullableId, Paginated, Params } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { CredentialEntity } from '../../../entities/Credential';
import logger from '../../../logger';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions {}

export class CredentialService {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: Partial<CredentialEntity>, params?: Params): Promise<CredentialEntity> {
    const credentialDataService = this.app.service('credentialData');

    try {
      const createdCredential = await credentialDataService.create(data, params);
      return createdCredential;
    } catch (e) {
      logger.warn('error in CredentialDataService.create', e);
      throw e;
    }
  }

  async get (uuid: NullableId, params?: Params): Promise<CredentialEntity> {
    const credentialDataService = this.app.service('credentialData');

    try {
      const credential = await credentialDataService.get(uuid, params);
      return credential;
    } catch (e) {
      logger.warn('error in CredentialDataService.get', e);
      throw e;
    }
  }

  async find (params?: Params): Promise<CredentialEntity[] | Paginated<CredentialEntity>> {
    const credentialDataService = this.app.service('credentialData');
    try {
      const credentials = await credentialDataService.find(params);
      return credentials;
    } catch (e) {
      logger.warn('error in CredentialDataService.find', e);
      throw e;
    }
  }

  async remove (uuid: NullableId, params?: Params): Promise<CredentialEntity | { success: boolean }> {
    const credentialDataService = this.app.service('credentialData');
    try {
      const response = await credentialDataService.remove(uuid, params);
      return response;
    } catch (e) {
      logger.warn('error in CredentialDataService.remove', e);
      throw e;
    }
  }
}
