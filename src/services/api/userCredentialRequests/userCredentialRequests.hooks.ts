import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../../hooks/validateCredentialRequest';
import { config } from '../../../config';
import { getIssuerEntity } from '../../hooks/getIssuerEntity';
import { SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { BadRequest } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';

const validateUserCredentialRequest: Hook = async (ctx) => {
  const data = ctx.data as SubjectCredentialRequestsEnrichedDto;

  if (!data) {
    throw new BadRequest('Invalid body must be defined.');
  }

  if (!data.credentialRequestsInfo && !data.userDidAssociation) {
    throw new BadRequest('Invalid body: userDidAssociation or credentialRequestsInfo must be defined.');
  }

  return ctx;
};

export const hooks = {
  before: {
    all: [validateCredentialRequest],
    create: [getIssuerEntity(config.DEFAULT_ISSUER_DID), validateUserCredentialRequest, handleUserDidAssociation]
  },
  after: {}
};
