import { Application as ExpressFeathers } from '@feathersjs/express';
import { Id, NullableId, Params, Paginated } from '@feathersjs/feathers';

import { RequestDto, ResponseDto } from './types';

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

export interface DtoServiceMethods<T = any> {
  [key: string]: any;

  find? (params?: Params): Promise<ResponseDto<T[] | Paginated<T>>>;

  get? (id: NullableId, params?: Params): Promise<ResponseDto<T>>;

  create? (data: RequestDto<T | T[]>, params?: Params): Promise<ResponseDto<T | T[]>>;

  update? (id: NullableId, data: RequestDto<T | T[]>, params?: Params): Promise<ResponseDto<T | T[]>>;

  patch? (id: NullableId, data: RequestDto<T |T[]>, params?: Params): Promise<ResponseDto<T | T[]>>;

  remove? (id: NullableId, params?: Params): Promise<ResponseDto<T | T[]>>;
}

export interface DtoServiceOverloads<T> {
  create? (data: RequestDto<T>, params?: Params): Promise<ResponseDto<T>>;
  create? (data: RequestDto<T[]>, params?: Params): Promise<ResponseDto<T[]>>;

  patch?(id: Id, data: RequestDto<T>, params?: Params): Promise<ResponseDto<T>>;
  patch?(id: null, data: RequestDto<T[]>, params?: Params): Promise<ResponseDto<T[]>>;

  update?(id: Id, data: RequestDto<T>, params?: Params): Promise<ResponseDto<T>>;
  update?(id: null, data: RequestDto<T[]>, params?: Params): Promise<ResponseDto<T[]>>;

 remove?(id: Id, params?: Params): Promise<ResponseDto<T>>;
 remove?(id: null, params?: Params): Promise<ResponseDto<T[]>>;
}
