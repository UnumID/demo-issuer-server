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

export const buildKYCCredentialSubject = (did: string, firstName: string): KYCCredentialSubject => ({
  id: did,
  firstName,
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

  // issue a DemoAuthCredential using the server sdk
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
    patch: [getDefaultIssuerEntity, issueAuthCredential, issueKYCCredential]
  }
};
