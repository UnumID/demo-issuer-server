import { NullableId, Params } from '@feathersjs/feathers';

import { Application, DtoServiceMethods } from '../../../declarations';
import { RequestDto, ResponseDto } from '../../../types';
import { IssuerEntity } from '../../../entities/Issuer';
import logger from '../../../logger';

type IssuerRequestDto = RequestDto<IssuerEntity>;
export type IssuerResponseDto = ResponseDto<IssuerEntity>;
export type IssuerListResponseDto = ResponseDto<IssuerEntity[]>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions { }

export class IssuerService implements DtoServiceMethods<IssuerEntity> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (requestDto: IssuerRequestDto, params?: Params): Promise<IssuerResponseDto> {
    const issuerDataService = this.app.service('issuerData');

    try {
      const createdIssuer = await issuerDataService.create(requestDto.data, params);
      return { result: createdIssuer };
    } catch (e) {
      logger.warn('error in IssuerDataService.create', e);
      throw e;
    }
  }

  async get (uuid: NullableId, params?: Params): Promise<IssuerResponseDto> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const issuer = await issuerDataService.get(uuid, params);
      return { result: issuer };
    } catch (e) {
      logger.error('error in IssuerDataService.get', e);
      throw e;
    }
  }

  async find (params?: Params): Promise<IssuerListResponseDto> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const issuers = await issuerDataService.find(params);
      return { result: issuers };
    } catch (e) {
      logger.error('error in IssuerDataService.find', e);
      throw e;
    }
  }

  async patch (uuid: NullableId, requestDto: IssuerRequestDto, params?: Params): Promise<IssuerResponseDto> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const patchedIssuer = await issuerDataService.patch(uuid, requestDto.data, params);
      return { result: patchedIssuer };
    } catch (e) {
      logger.error('error in IssuerDataService.patch', e);
      throw e;
    }
  }

  async remove (uuid: NullableId, params?: Params): Promise<IssuerResponseDto> {
    const issuerDataService = this.app.service('issuerData');
    try {
      const response = await issuerDataService.remove(uuid, params);
      return { result: response };
    } catch (e) {
      logger.warn('error in IssuerDataService.remove', e);
      throw e;
    }
  }
}
