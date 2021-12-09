import { Hook } from '@feathersjs/feathers';

import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { User } from '../../../entities/User';
import { UnumDto, updateCredentialStatus, VerifiedStatus, verifySubjectDidDocument } from '@unumid/server-sdk';
import { SubjectCredentialRequestsEnrichedDto } from '@unumid/types';

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

// async function handleUserDidAssociation (data: UserDidAssociation, issuer: IssuerEntity, userDataService: Service<User>, issuerData) {
export const handleUserDidAssociation: Hook = async (ctx) => {
  const { app, params } = ctx;

  // need to get an existing user either by the userIdentifier or by the subjectDid
  const userDataService = app.service('userData');
  let user: User;

  const issuer: IssuerEntity = params?.defaultIssuerEntity;
  const data: SubjectCredentialRequestsEnrichedDto = ctx.data;

  // const userDidAssociation = data.userDidAssociation;
  const { userDidAssociation, credentialRequestsInfo: { subjectDid } } = data;

  if (!userDidAssociation) {
    logger.debug('No new userDidAssociation in the userCredentialRequests');

    // grabbing user by subjectDid
    try {
      user = await userDataService.get(null, { where: { did: subjectDid } }); // will throw exception if not found
    } catch (e) {
      logger.warn(`No user found with did ${subjectDid}. This should never happen.`);
      throw e;
    }

    return {
      ...ctx,
      data: {
        ...ctx.data,
        user
      }
    };
  }

  const { userIdentifier, subjectDidDocument } = userDidAssociation;

  try {
    user = await userDataService.get(userIdentifier); // will throw exception if not found
  } catch (e) {
    logger.warn(`No user found with id ${userIdentifier}. Can not associate the did ${subjectDidDocument.id}.`);
    throw e;
  }

  // verify the subject did document
  const result: UnumDto<VerifiedStatus> = await verifySubjectDidDocument(issuer.authToken, issuer.issuerDid, subjectDidDocument);

  if (!result.body.isVerified) {
    throw new Error(`${result.body.message} Subject DID document ${subjectDidDocument.id} for user ${userIdentifier} is not verified.`);
  }

  const userDid = subjectDidDocument.id;

  if (userDid !== user.did) {
    // revoke all credentials associated with old did
    // TODO: revoke all credentials associated with old did
    // await updateCredentialStatuses(issuer.authToken, issuer.issuerDid, issuer.privateKey, VerifiedStatus.Revoked);
    // await revokeAllCredentials(issuer.authToken, issuer.issuerDid, issuer.privateKey, user.did);

    // update the user with the new did
    await userDataService.patch(userIdentifier, { did: userDid });
  } else {
    logger.debug('User association information sent with identical user did information. This should never happen.');
  }

  // update the default issuer's auth token if it has been reissued
  if (result.authToken !== issuer.authToken) {
    const issuerDataService = app.service('issuerData');
    try {
      await issuerDataService.patch(issuer.uuid, { authToken: result.authToken });
    } catch (e) {
      logger.error('CredentialRequest create caught an error thrown by issuerDataService.patch', e);
      throw e;
    }
  }

  return {
    ...ctx,
    data: {
      ...ctx.data,
      user
    }
  };
};

export const hooks = {
  before: {
    all: [validateRequest],
    create: [getDefaultIssuerEntity, handleUserDidAssociation]
  },
  after: {}
};
