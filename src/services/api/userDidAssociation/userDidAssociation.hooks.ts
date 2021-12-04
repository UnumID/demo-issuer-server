import { Hook } from '@feathersjs/feathers';

import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';

export const getDefaultIssuerEntity: Hook = async (ctx) => {
  const issuerDataService = ctx.app.service('issuerData');
  let defaultIssuerEntity: IssuerEntity;
  try {
    defaultIssuerEntity = await issuerDataService.getDefaultIssuerEntity();

    return {
      ...ctx,
      params: {
        ...ctx.params,
        defaultIssuerEntity
      }

    };
  } catch (e) {
    logger.error('getDefaultIssuerEntity hook caught an error thrown by issuerDataService.getDefaultIssuerEntity', e);
    throw e;
  }
};

export const hooks = {
  before: {
    create: [getDefaultIssuerEntity]
  },
  after: {}
};
