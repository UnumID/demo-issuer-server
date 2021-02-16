import { NullableId, Params } from '@feathersjs/feathers';

import { Application, DtoServiceMethods } from '../../../declarations';
import { RequestDto, ResponseDto } from '../../../types';
import { CredentialEntity } from '../../../entities/Credential';
import logger from '../../../logger';

type CredentialRequestDto = RequestDto<CredentialEntity>;
export type CredentialResponseDto = ResponseDto<CredentialEntity>;
export type CredentialListResponseDto = ResponseDto<CredentialEntity[]>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions {}

export class CredentialService implements DtoServiceMethods<CredentialEntity> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (requestDto: CredentialRequestDto, params?: Params): Promise<CredentialResponseDto> {
    const credentialDataService = this.app.service('credentialData');

    try {
      const createdCredential = await credentialDataService.create(requestDto.data, params);
      return { result: createdCredential };
    } catch (e) {
      logger.warn('error in CredentialDataService.create', e);
      throw e;
    }
  }

  async get (uuid: NullableId, params?: Params): Promise<CredentialResponseDto> {
    const credentialDataService = this.app.service('credentialData');

    try {
      const credential = await credentialDataService.get(uuid, params);
      return { result: credential };
    } catch (e) {
      logger.warn('error in CredentialDataService.get', e);
      throw e;
    }
  }

  async find (params?: Params): Promise<CredentialListResponseDto> {
    const credentialDataService = this.app.service('credentialData');
    try {
      const credentials = await credentialDataService.find(params);
      return { result: credentials };
    } catch (e) {
      logger.warn('error in CredentialDataService.find', e);
      throw e;
    }
  }

  async remove (uuid: NullableId, params?: Params): Promise<CredentialResponseDto> {
    const credentialDataService = this.app.service('credentialData');
    try {
      const response = await credentialDataService.remove(uuid, params);
      return { result: response };
    } catch (e) {
      logger.warn('error in CredentialDataService.remove', e);
      throw e;
    }
  }
}
