import { Hook } from '@feathersjs/feathers';

import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';

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

export const validateRequest: Hook = async (ctx) => {
  const { params } = ctx;

  if (!params.headers?.version) {
    logger.info('CredentialRequest request made without version');
  } else {
    logger.info(`CredentialRequest request made with version ${params.headers?.version}`);
  }

  return ctx;
};

export const hooks = {
  before: {
    all: [validateRequest],
    create: [getDefaultIssuerEntity, handleUserDidAssociation]
  },
  after: {}
};
