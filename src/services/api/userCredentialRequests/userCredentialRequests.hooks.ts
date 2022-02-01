import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../../hooks/validateCredentialRequest';
import { config } from '../../../config';
import { getIssuerEntity } from '../../hooks/getIssuerEntity';

export const hooks = {
  before: {
    all: [validateCredentialRequest],
    create: [getIssuerEntity(config.DEFAULT_ISSUER_DID), handleUserDidAssociation]
  },
  after: {}
};
