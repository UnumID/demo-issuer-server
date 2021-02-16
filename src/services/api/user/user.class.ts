import { NullableId, Params } from '@feathersjs/feathers';

import { Application, DtoServiceMethods } from '../../../declarations';
import { RequestDto, ResponseDto } from '../../../types';
import { User } from '../../../entities/User';
import logger from '../../../logger';

type UserRequestDto = RequestDto<User>;
export type UserResponseDto = ResponseDto<User>;
export type UserListResponseDto = ResponseDto<User[]>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions { }

export class UserService implements DtoServiceMethods<User> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (requestDto: UserRequestDto, params?: Params): Promise<UserResponseDto> {
    const userDataService = this.app.service('userData');

    try {
      const createdUser = await userDataService.create(requestDto.data, params);
      return { result: createdUser };
    } catch (e) {
      logger.warn('error in UserDataService.create', e);
      throw e;
    }
  }

  async get (uuid: NullableId, params?: Params): Promise<UserResponseDto> {
    const userDataService = this.app.service('userData');
    try {
      const user = await userDataService.get(uuid, params);
      return { result: user };
    } catch (e) {
      logger.error('error in UserDataService.get', e);
      throw e;
    }
  }

  async find (params?: Params): Promise<UserListResponseDto> {
    const userDataService = this.app.service('userData');
    try {
      const users = await userDataService.find(params);
      return { result: users };
    } catch (e) {
      logger.error('error in UserDataService.find', e);
      throw e;
    }
  }

  async patch (uuid: NullableId, requestDto: UserRequestDto, params?: Params): Promise<UserResponseDto> {
    const userDataService = this.app.service('userData');
    try {
      const patchedUser = await userDataService.patch(uuid, requestDto.data, params);
      return { result: patchedUser };
    } catch (e) {
      logger.error('error in UserDataService.patch', e);
      throw e;
    }
  }

  async remove (uuid: NullableId, params?: Params): Promise<UserResponseDto> {
    const userDataService = this.app.service('userData');
    try {
      const response = await userDataService.remove(uuid, params);
      return { result: response };
    } catch (e) {
      logger.warn('error in UserService.remove', e);
      throw e;
    }
  }
}
