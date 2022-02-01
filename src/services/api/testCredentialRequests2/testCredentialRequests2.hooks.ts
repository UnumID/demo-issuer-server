import { Hook } from '@feathersjs/feathers';

import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { config } from '../../../config';
import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';

export const getIssuerEntity: Hook = async (ctx) => {
  const issuerDataService = ctx.app.service('issuerData');
  let issuerEntity: IssuerEntity;
  try {
    issuerEntity = await issuerDataService.getByDid(config.TEST_ISSUER_DID_2);

    return {
      ...ctx,
      params: {
        ...ctx.params,
        issuerEntity
      }

    };
  } catch (e) {
    logger.error('getIssuerEntity hook caught an error thrown by issuerDataService.getByDid', e);
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
    create: [getIssuerEntity, handleUserDidAssociation]
  },
  after: {}
};
