import { Hook } from '@feathersjs/feathers';

import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { User } from '../../../entities/User';
import { UnumDto, revokeAllCredentials, VerifiedStatus, verifySubjectDidDocument } from '@unumid/server-sdk';
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

/**
 * Grab and return the associated user. If useDidAssociation is passed update the user with the provided did.
 * @param ctx
 * @returns
 */
export const handleUserDidAssociation: Hook = async (ctx) => {
  const { app, params } = ctx;

  // need to get an existing user either by the userIdentifier or by the subjectDid
  const userDataService = app.service('userData');
  let user: User;

  const issuer: IssuerEntity = params?.defaultIssuerEntity;
  const data: SubjectCredentialRequestsEnrichedDto = ctx.data;

  const { userDidAssociation, credentialRequestsInfo: { subjectDid } } = data;

  // if no userDidAssociation as part of request body then it is assume this issuer already has the did associated with a user
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

  const { userCode, subjectDidDocument } = userDidAssociation;

  try {
    // assuming user code is the object id... TODO change to query based on attribute
    user = await userDataService.get(null, { where: { userCode } }); // will throw exception if not found
  } catch (e) {
    logger.warn(`No user found with code ${userCode}. Can not associate the did ${subjectDidDocument.id}.`);
    throw e;
  }

  // verify the subject did document
  const result: UnumDto<VerifiedStatus> = await verifySubjectDidDocument(issuer.authToken, issuer.issuerDid, subjectDidDocument);

  if (!result.body.isVerified) {
    throw new Error(`${result.body.message} Subject DID document ${subjectDidDocument.id} for user ${userCode} is not verified.`);
  }

  const userDid = subjectDidDocument.id;

  // if this is a new did association for the user then we need to revoke all the credentials associated with teh old did document
  if (userDid !== user.did) {
    // revoke all credentials associated with old did
    await revokeAllCredentials(issuer.authToken, issuer.issuerDid, issuer.privateKey, userDid);

    // update the user with the new did
    await userDataService.patch(null, { did: userDid, userCode: null }, { where: { userCode } });
  } else {
    logger.debug('User association information sent with identical user did information. This should never happen.');
    await userDataService.patch(null, { userCode: null }, { where: { userCode } }); // remove the userCode from the user
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
