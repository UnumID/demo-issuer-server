import { BadRequest, GeneralError } from '@feathersjs/errors';
import { Hook } from '@feathersjs/feathers';
import { issueCredential as sdkIssueCredential, IssuerDto } from '@unumid/server-sdk';
import { Credential, CredentialSubject } from '@unumid/types';
import { Service as MikroOrmService } from 'feathers-mikro-orm';

import { User } from '../../../entities/User';
import { CredentialEntity, CredentialEntityOptions } from '../../../entities/Credential';
import logger from '../../../logger';
import { IssuerEntity } from '../../../entities/Issuer';

interface AuthCredentialSubject extends CredentialSubject {
  isAuthorized: true;
  userUuid: string;
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

type UserServiceHook = Hook<Partial<User>>;

export const buildAuthCredentialSubject = (did: string, userUuid: string): AuthCredentialSubject => ({
  id: did,
  isAuthorized: true,
  userUuid
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
  credentialType: string
): Promise<IssuerDto<Credential>> => {
  let authCredentialResponse;

  try {
    authCredentialResponse = await sdkIssueCredential(
      formatBearerToken(issuerEntity.authToken),
      credentialType,
      issuerEntity.issuerDid,
      credentialSubject,
      issuerEntity.privateKey
    );
    return authCredentialResponse as IssuerDto<Credential>;
  } catch (e) {
    logger.error('issueCredential caught an error thrown by the server sdk', e);
    throw e;
  }
};

export const convertIssuerDtoToCredentialEntityOptions = (issuerDto: IssuerDto<Credential>): CredentialEntityOptions => ({
  credentialContext: issuerDto.body['@context'],
  credentialId: issuerDto.body.id,
  credentialCredentialSubject: issuerDto.body.credentialSubject,
  credentialCredentialStatus: issuerDto.body.credentialStatus,
  credentialIssuer: issuerDto.body.issuer,
  credentialType: issuerDto.body.type,
  credentialIssuanceDate: issuerDto.body.issuanceDate,
  credentialExpirationDate: issuerDto.body.expirationDate,
  credentialProof: issuerDto.body.proof
});

export const getDefaultIssuerEntity: UserServiceHook = async (ctx) => {
  const issuerDataService = ctx.app.service('issuerData');
  let defaultIssuerEntity: IssuerEntity;
  try {
    defaultIssuerEntity = await issuerDataService.getDefaultIssuerEntity();

    return {
      ...ctx,
      params: {
        defaultIssuerEntity
      }

    };
  } catch (e) {
    logger.error('getDefaultIssuerEntity hook caught an error thrown by issuerDataService.getDefaultIssuerEntity', e);
    throw e;
  }
};

export const issueAuthCredential: UserServiceHook = async (ctx) => {
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
    throw new GeneralError('Error in issuerAuthCredential hook: defaultIssuerEntity param is not set. Did you forget to run the getDefaultIssuerEntity hook first?');
  }

  // issue a DemoAuthCredential using the server sdk
  const authCredentialSubject = buildAuthCredentialSubject(did, id as string);
  const issuerDto = await issueCredential(defaultIssuerEntity, authCredentialSubject, 'DemoAuthCredential');

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  const credentialEntityOptions = convertIssuerDtoToCredentialEntityOptions(issuerDto);
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

  // issue a DemoAuthCredential using the server sdk
  const KYCCredentialSubject = buildKYCCredentialSubject(did);
  const issuerDto = await issueCredential(defaultIssuerEntity, KYCCredentialSubject, 'KYCCredential');

  // store the issued credential
  const credentialDataService = ctx.app.service('credentialData') as MikroOrmService<CredentialEntity>;
  const credentialEntityOptions = convertIssuerDtoToCredentialEntityOptions(issuerDto);
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

export const hooks = {
  after: {
    patch: [getDefaultIssuerEntity, issueAuthCredential, issueKYCCredential]
  }
};
