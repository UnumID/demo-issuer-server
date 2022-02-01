import { Hook } from '@feathersjs/feathers';

import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { config } from '../../../config';
import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../../hooks/validateCredentialRequest';

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

export const hooks = {
  before: {
    all: [validateCredentialRequest],
    create: [getIssuerEntity, handleUserDidAssociation]
  },
  after: {}
};
