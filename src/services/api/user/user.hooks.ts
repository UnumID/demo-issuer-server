import { BadRequest, GeneralError } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';
import { convertCredentialSubject, issueCredential as sdkIssueCredential, UnumDto } from '@unumid/server-sdk';
import { CredentialPb, CredentialSubject, ProofPb } from '@unumid/types';
import { Service as MikroOrmService } from 'feathers-mikro-orm';

import { User } from '../../../entities/User';
import { CredentialEntity, CredentialEntityOptions } from '../../../entities/Credential';
import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { CredentialStatus } from '@unumid/types/build/protos/credential';
import { AuthCredentialSubject, buildAuthCredentialSubject, buildEmailCredentialSubject, buildKYCCredentialSubject, EmailCredentialSubject, issueCredentialsHelper, KYCCredentialSubject } from '../../../utils/credentials';
import { formatBearerToken } from '../../../utils/formatBearerToken';
import { convertCredentialToCredentialEntityOptions } from '../../../utils/converters';

type UserServiceHook = Hook<User>;

export const issueCredential = async (
  issuerEntity: IssuerEntity,
  credentialSubject: CredentialSubject,
  credentialType: string
): Promise<UnumDto<CredentialPb>> => {
  let authCredentialResponse;

  try {
    authCredentialResponse = await sdkIssueCredential(
      formatBearerToken(issuerEntity.authToken),
      credentialType,
      issuerEntity.issuerDid,
      credentialSubject,
      issuerEntity.privateKey
    );

    return authCredentialResponse as UnumDto<CredentialPb>;
  } catch (e) {
    logger.error('issueCredential caught an error thrown by the server sdk', e);
    throw e;
  }
};

export const convertUnumDtoToCredentialEntityOptions = (issuerDto: UnumDto<CredentialPb>): CredentialEntityOptions => {
  const proof: ProofPb = {
    ...issuerDto.body.proof,
    created: issuerDto.body.proof?.created,
    signatureValue: (issuerDto.body.proof?.signatureValue as string),
    type: issuerDto.body.proof?.type as string,
    verificationMethod: issuerDto.body.proof?.verificationMethod as string,
    proofPurpose: issuerDto.body.proof?.proofPurpose as string
  };

  return {
    credentialContext: (issuerDto.body.context as ['https://www.w3.org/2018/credentials/v1', ...string[]]), // the proto type def can not have constants, but the value is ensured prior to sending to saas for encrypted persistence.
    credentialId: issuerDto.body.id,
    credentialCredentialSubject: convertCredentialSubject(issuerDto.body.credentialSubject),
    credentialCredentialStatus: (issuerDto.body.credentialStatus as CredentialStatus),
    credentialIssuer: issuerDto.body.issuer,
    credentialType: (issuerDto.body.type as ['VerifiableCredential', ...string[]]), // the proto type def can not have constants, but the value is ensured prior to sending to saas for encrypted persistence.
    credentialIssuanceDate: issuerDto.body.issuanceDate as Date,
    credentialExpirationDate: issuerDto.body.expirationDate,
    credentialProof: proof
  };
};

export const getDefaultIssuerEntity: UserServiceHook = async (ctx) => {
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

export const issueAuthAndKYCAndEmailCredentials: UserServiceHook = async (ctx) => {
  const { id, data, result, params } = ctx;
  const defaultIssuerEntity = params.defaultIssuerEntity as IssuerEntity;

  if (!data || !id || !result) {
    throw new BadRequest();
  }

  // only run this hook if the did is being updated
  const { did } = data;
  if (!did) {
    return ctx;
  }

  if (!defaultIssuerEntity) {
    throw new GeneralError('Error in issuerAuthCredential hook: defaultIssuerEntity param is not set. Did you forget to run the getDefaultIssuerEntity hook first?');
  }

  // issue a DemoAuthCredential & KYCCredential using the server sdk
  const authCredentialSubject: AuthCredentialSubject = buildAuthCredentialSubject(did, id as string, result.email);
  const emailCredentialSubject: EmailCredentialSubject = buildEmailCredentialSubject(did, result.email);
  const KYCCredentialSubject: KYCCredentialSubject = buildKYCCredentialSubject(did, result.firstName as string || 'Richard');

  const issuerDto: UnumDto<CredentialPb[]> = await issueCredentialsHelper(defaultIssuerEntity, did, [authCredentialSubject, emailCredentialSubject, KYCCredentialSubject]);

  // store the issued credentials
  const credentials: CredentialPb[] = issuerDto.body;
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;

  for (const issuedCredential of credentials) {
    const credentialEntityOptions = convertCredentialToCredentialEntityOptions(issuedCredential);

    try {
      await credentialDataService.create(credentialEntityOptions);
    } catch (e) {
      logger.error('issueAuthAndKYCAndEmailCredentials hook caught an error thrown by credentialDataService.create', e);
      throw e;
    }
  }

  // update the default issuer's auth token if it has been reissued
  if (issuerDto.authToken !== defaultIssuerEntity.authToken) {
    const issuerDataService = ctx.app.service('issuerData');
    try {
      await issuerDataService.patch(defaultIssuerEntity.uuid, { authToken: issuerDto.authToken });
    } catch (e) {
      logger.error('issueAuthAndKYCAndEmailCredentials hook caught an error thrown by issuerDataService.patch', e);
      throw e;
    }
  }

  return ctx;
};

export const issueAuthCredential: UserServiceHook = async (ctx) => {
  const { id, data, result, params } = ctx;
  const defaultIssuerEntity = params.defaultIssuerEntity as IssuerEntity;

  if (!data || !id || !result) {
    throw new BadRequest();
  }

  // only run this hook if the did is being updated
  const { did } = data;
  if (!did) {
    return ctx;
  }

  if (!defaultIssuerEntity) {
    throw new GeneralError('Error in issuerAuthCredential hook: defaultIssuerEntity param is not set. Did you forget to run the getDefaultIssuerEntity hook first?');
  }

  // issue a DemoAuthCredential using the server sdk
  const authCredentialSubject = buildAuthCredentialSubject(did, id as string, result.email);
  const issuerDto = await issueCredential(defaultIssuerEntity, authCredentialSubject, 'DemoAuthCredential');

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  const credentialEntityOptions = convertUnumDtoToCredentialEntityOptions(issuerDto);

  try {
    await credentialDataService.create(credentialEntityOptions);
  } catch (e) {
    logger.error('issueAuthCredential hook caught an error thrown by credentialDataService.create', e);
    throw e;
  }

  // update the default issuer's auth token if it has been reissued
  if (issuerDto.authToken !== defaultIssuerEntity.authToken) {
    const issuerDataService = ctx.app.service('issuerData');
    try {
      await issuerDataService.patch(defaultIssuerEntity.uuid, { authToken: issuerDto.authToken });
    } catch (e) {
      logger.error('issueAuthCredential hook caught an error thrown by issuerDataService.patch', e);
      throw e;
    }
  }

  return ctx;
};

export const issueKYCCredential: UserServiceHook = async (ctx) => {
  const { id, data, params, result } = ctx;
  const defaultIssuerEntity = params.defaultIssuerEntity as IssuerEntity;

  if (!data || !id || !result) {
    throw new BadRequest();
  }

  // only run this hook if the did is being updated
  const { did } = data;
  if (!did) {
    return ctx;
  }

  if (!defaultIssuerEntity) {
    throw new GeneralError('Error in issueKYCCredential hook: defaultIssuerEntity param is not set. Did you forget to run the getDefaultIssuerEntity hook first?');
  }

  // issue a KYCCredential using the server sdk
  const KYCCredentialSubject = buildKYCCredentialSubject(did, result.firstName as string || 'Richard');
  const issuerDto = await issueCredential(defaultIssuerEntity, KYCCredentialSubject, 'KYCCredential');

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  const credentialEntityOptions = convertUnumDtoToCredentialEntityOptions(issuerDto);

  try {
    await credentialDataService.create(credentialEntityOptions);
  } catch (e) {
    logger.error('issueKYCCredential hook caught an error thrown by credentialDataService.create', e);
    throw e;
  }

  // update the default issuer's auth token if it has been reissued
  if (issuerDto.authToken !== defaultIssuerEntity.authToken) {
    const issuerDataService = ctx.app.service('issuerData');
    try {
      await issuerDataService.patch(defaultIssuerEntity.uuid, { authToken: issuerDto.authToken });
    } catch (e) {
      logger.error('issueKYCCredential hook caught an error thrown by issuerDataService.patch', e);
      throw e;
    }
  }

  return ctx;
};

export const validateRequest: UserServiceHook = async (ctx) => {
  const { params } = ctx;

  if (!params.headers?.version) {
    logger.info('User request made without version');
  } else {
    logger.info(`User request made with version ${params.headers?.version}`);
  }

  return ctx;
};

export const hooks = {
  before: {
    all: [validateRequest]
  },
  after: {
    patch: [getDefaultIssuerEntity, issueAuthAndKYCAndEmailCredentials]
  }
};
