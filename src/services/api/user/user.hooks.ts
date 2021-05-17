import { BadRequest, GeneralError } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';
import { convertCredentialSubject, issueCredential as sdkIssueCredential, UnumDto } from '@unumid/server-sdk';
import { issueCredential as sdkIssueCredentialDeprecatedV2 } from '@unumid/server-sdk-deprecated-v2';
import { issueCredential as sdkIssueCredentialDeprecatedV1 } from '@unumid/server-sdk-deprecated-v1';
import { Credential, CredentialPb, CredentialSubject, Proof, ProofPb } from '@unumid/types';
import { Credential as CredentialDeprecatedV2 } from '@unumid/types-deprecated-v2';
import { Credential as CredentialDeprecatedV1 } from '@unumid/types-deprecated-v1';
import { Service as MikroOrmService } from 'feathers-mikro-orm';

import { User } from '../../../entities/User';
import { CredentialEntity, CredentialEntityOptions } from '../../../entities/Credential';
import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';
import { lt } from 'semver';
import { CredentialStatus } from '@unumid/types/build/protos/credential';

interface AuthCredentialSubject extends CredentialSubject {
  isAuthorized: true;
  userUuid: string;
  userEmail: string;
}

interface KYCCredentialSubject extends CredentialSubject {
  firstName: string;
  lastName: string;
  ssn4: number;
  contactInformation: {
    emailAddress: string;
    phoneNumber: string;
    homeAddress: {
      line1: string;
      city: string;
      state: string;
      zip: number;
      country: string;
    }
  },
  driversLicense: {
    state: string;
    number: string;
    expiration: string;
  },
  accounts: {
    checking: {
      accountNumber: string;
      routingNumber: string;
    }
  },
  confidence: string;
}

type UserServiceHook = Hook<User>;

export const buildAuthCredentialSubject = (did: string, userUuid: string, userEmail: string): AuthCredentialSubject => ({
  id: did,
  isAuthorized: true,
  userUuid,
  userEmail
});

export const buildKYCCredentialSubject = (did: string): KYCCredentialSubject => ({
  id: did,
  firstName: 'Richard',
  lastName: 'Hendricks',
  ssn4: 4321,
  contactInformation: {
    emailAddress: 'richard@piedpiper.net',
    phoneNumber: '1073741824',
    homeAddress: {
      line1: '5320 Newell Rd',
      city: 'Palo Alto',
      state: 'CA',
      zip: 94303,
      country: 'United States'
    }
  },
  driversLicense: {
    state: 'CA',
    number: '6383736743891101',
    expiration: '2026-01-14T00:00:00.000Z'
  },
  accounts: {
    checking: {
      accountNumber: '543888430912',
      routingNumber: '021000021'
    }
  },
  confidence: '99%'
});

export const formatBearerToken = (token: string): string =>
  token.startsWith('Bearer ') ? token : `Bearer ${token}`;

export const issueCredential = async (
  issuerEntity: IssuerEntity,
  credentialSubject: CredentialSubject,
  credentialType: string,
  version: string
): Promise<UnumDto<CredentialDeprecatedV2> | UnumDto<CredentialDeprecatedV1>> => {
  let authCredentialResponse;

  try {
    if (lt(version, '2.0.0')) {
      authCredentialResponse = await sdkIssueCredentialDeprecatedV1(
        formatBearerToken(issuerEntity.authToken),
        credentialType,
        issuerEntity.issuerDid,
        credentialSubject,
        issuerEntity.privateKey
      );

      return authCredentialResponse as UnumDto<CredentialDeprecatedV1>;
    }

    authCredentialResponse = await sdkIssueCredentialDeprecatedV2(
      formatBearerToken(issuerEntity.authToken),
      credentialType,
      issuerEntity.issuerDid,
      credentialSubject,
      issuerEntity.privateKey
    );

    return authCredentialResponse as UnumDto<CredentialDeprecatedV2>;
  } catch (e) {
    logger.error('issueCredential caught an error thrown by the server sdk', e);
    throw e;
  }
};

export const issueCredentialV3 = async (
  issuerEntity: IssuerEntity,
  credentialSubject: CredentialSubject,
  credentialType: string,
  version: string
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

export const convertUnumDtoToCredentialEntityOptions = (issuerDto: UnumDto<CredentialDeprecatedV2> | UnumDto<CredentialDeprecatedV1>, version: string): CredentialEntityOptions => {
  const proof: Proof = {
    ...issuerDto.body.proof,
    created: (issuerDto.body.proof as Proof).created
  };

  // const context = (issuerDto.body as CredentialDeprecatedV2)['@context'] ? (issuerDto.body as CredentialDeprecatedV2)['@context'] : (issuerDto.body as CredentialPb).context;
  const context = issuerDto.body['@context'];

  return {
    // credentialContext: lt(version, '3.0.0') ? (issuerDto.body as CredentialDeprecatedV2)['@context'] : (issuerDto.body as CredentialPb).context,
    credentialContext: context,
    credentialId: issuerDto.body.id,
    credentialCredentialSubject: lt(version, '2.0.0') ? (issuerDto.body as CredentialDeprecatedV1).credentialSubject : convertCredentialSubject((issuerDto.body as CredentialDeprecatedV2).credentialSubject),
    credentialCredentialStatus: issuerDto.body.credentialStatus,
    credentialIssuer: issuerDto.body.issuer,
    credentialType: issuerDto.body.type,
    credentialIssuanceDate: issuerDto.body.issuanceDate,
    credentialExpirationDate: issuerDto.body.expirationDate,
    credentialProof: proof
  };
};

export const convertUnumDtoToCredentialEntityOptionsV3 = (issuerDto: UnumDto<CredentialPb>, version: string): CredentialEntityOptions => {
  const proof: Proof = {
    ...issuerDto.body.proof,
    created: (issuerDto.body.proof as Proof).created,
    signatureValue: (issuerDto.body.proof?.signatureValue as string),
    type: issuerDto.body.proof?.type as string,
    verificationMethod: issuerDto.body.proof?.verificationMethod as string,
    proofPurpose: issuerDto.body.proof?.proofPurpose as string
  };

  return {
    credentialContext: issuerDto.body.context,
    credentialId: issuerDto.body.id,
    credentialCredentialSubject: convertCredentialSubject(issuerDto.body.credentialSubject),
    credentialCredentialStatus: (issuerDto.body.credentialStatus as CredentialStatus),
    credentialIssuer: issuerDto.body.issuer,
    credentialType: issuerDto.body.type,
    credentialIssuanceDate: issuerDto.body.issuanceDate as Date,
    credentialExpirationDate: issuerDto.body.expirationDate,
    // credentialProof: issuerDto.body.proof as ProofPb
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

export const issueAuthCredential: UserServiceHook = async (ctx) => {
  const { params } = ctx;

  if (lt(params.headers?.version, '3.0.0')) {
    return issueAuthCredentialV2(ctx);
  } else {
    return issueAuthCredentialV3(ctx);
  }
};

export const issueAuthCredentialV2: UserServiceHook = async (ctx) => {
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

  // set the version value to the default 1.0.0 is not present in the request headers
  let version = '1.0.0';
  if (params.headers?.version) {
    version = params.headers?.version;
  }

  // issue a DemoAuthCredential using the server sdk
  const authCredentialSubject = buildAuthCredentialSubject(did, id as string, result.email);
  const issuerDto = await issueCredential(defaultIssuerEntity, authCredentialSubject, 'DemoAuthCredential', version);

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  const credentialEntityOptions = convertUnumDtoToCredentialEntityOptions(issuerDto, version);
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

export const issueAuthCredentialV3: UserServiceHook = async (ctx) => {
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

  // set the version value to the default 1.0.0 is not present in the request headers
  let version = '1.0.0';
  if (params.headers?.version) {
    version = params.headers?.version;
  }

  // issue a DemoAuthCredential using the server sdk
  const authCredentialSubject = buildAuthCredentialSubject(did, id as string, result.email);
  // const issuerDto = await issueCredential(defaultIssuerEntity, authCredentialSubject, 'DemoAuthCredential', version);
  const issuerDto = await issueCredentialV3(defaultIssuerEntity, authCredentialSubject, 'DemoAuthCredential', version);

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  const credentialEntityOptions = convertUnumDtoToCredentialEntityOptionsV3(issuerDto, version);
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
  const { id, data, params } = ctx;
  const defaultIssuerEntity = params.defaultIssuerEntity as IssuerEntity;

  if (!data || !id) {
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

  // set the version value to the default 1.0.0 is not present in the request headers
  let version = '1.0.0';
  if (params.headers?.version) {
    version = params.headers?.version;
  }

  // issue a DemoAuthCredential using the server sdk
  const KYCCredentialSubject = buildKYCCredentialSubject(did);
  // const issuerDto = await issueCredential(defaultIssuerEntity, KYCCredentialSubject, 'KYCCredential', version);
  const issuerDto = await issueCredentialV3(defaultIssuerEntity, KYCCredentialSubject, 'KYCCredential', version);

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  // const credentialEntityOptions = convertUnumDtoToCredentialEntityOptions(issuerDto, version);
  const credentialEntityOptions = convertUnumDtoToCredentialEntityOptionsV3(issuerDto, version);
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
    // (params.headers as any).version = '1.0.0'; // base version
    throw new BadRequest('Version header required.');
  }

  logger.info(`User request made with version ${params.headers?.version}`);

  return ctx;
};

export const hooks = {
  before: {
    all: [validateRequest]
  },
  after: {
    patch: [getDefaultIssuerEntity, issueAuthCredential, issueKYCCredential]
  }
};
