import { HookContext } from '@feathersjs/feathers';
import { pick } from 'lodash';

import logger from './logger';
import { sanitizeValues } from './utils/sanitizeValues';

function logError (ctx: HookContext): void {
  const { path, method, error, data } = ctx;
  const { name, code, message, stack } = error;
  const sanitizedData = sanitizeValues(data, ['password']);
  const rawInfo = pick(ctx, ['params', 'id']);
  const info = { ...rawInfo, data: sanitizedData, stack };

  if (info.params?.headers?.authorization) {
    info.params.headers.authorization = 'Bearer *****';
  }

  if (info.params?.authToken) {
    info.params.authToken = '*****';
  }

  logger.warn(`Error in ${path}#${method}: name=${name} code=${code} message=${message}`, info);
}

function log (ctx: HookContext): void {
  const { path, method, id, data } = ctx;
  const sanitizedData = sanitizeValues(data, ['password']);
  logger.info(`${path}#${method}${id ? ` id: ${id}` : ''}${data ? ` data: ${JSON.stringify(sanitizedData)}}` : ''}`);
}

function logResult (ctx: HookContext): HookContext {
  const { path, method, result } = ctx;
  const string = JSON.stringify(result);
  const length = 1500; // prevent exceedingly long result log messages.
  const resultString = string.length < length ? string : string.substring(0, length - 3) + '...';

  logger.info(`${path}#${method} result: ${resultString}`);
  return ctx;
}

/**
 * This hook allows for params to be passed via socketio to a feather service through the query params.
 * ref: https://docs.feathersjs.com/api/socketio.html#params-query
 * @param ctx
 */
function checkParmasQuery (ctx: HookContext): void {
  const { params } = ctx;

  if (!params.query || !params.query.version) {
    return;
  }

  ctx.params = {
    ...params,
    headers: {
      ...params.headers,
      version: params.query?.version
    }
  };

  logger.info(`Added the version ${params.query.version} from the query params to params.`);
}

export default {
  before: {
    all: [log, checkParmasQuery],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [logResult],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logError],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
