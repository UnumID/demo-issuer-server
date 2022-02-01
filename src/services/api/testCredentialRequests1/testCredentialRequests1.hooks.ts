import { Hook } from '@feathersjs/feathers';

import { config } from '../../../config';
import { handleUserDidAssociation } from '../../hooks/handleUserDidAssociation';
import { validateCredentialRequest } from '../../hooks/validateCredentialRequest';
import { getIssuerEntity } from '../../hooks/getIssuerEntity';

export const hooks = {
  before: {
    all: [validateCredentialRequest],
    create: [getIssuerEntity(config.TEST_ISSUER_DID_1), handleUserDidAssociation]
  },
  after: {}
};
