import { config } from '../../../config';
import { getIssuerEntity } from '../../hooks/getIssuerEntity';
import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../../hooks/validateCredentialRequest';

export const hooks = {
  before: {
    all: [validateCredentialRequest],
    create: [getIssuerEntity(config.TEST_ISSUER_DID_2), handleUserDidAssociation]
  },
  after: {}
};
