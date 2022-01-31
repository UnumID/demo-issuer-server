import { UnumDto, issueCredentials as sdkIssueCredentials, issueCredentials } from '@unumid/server-sdk';
import { CredentialData, CredentialPb, CredentialSubject } from '@unumid/types';
import { IssuerEntity } from '../entities/Issuer';
import logger from '../logger';
import { formatBearerToken } from './formatBearerToken';

export interface EmailCredentialSubject extends CredentialSubject {
    type: 'EmailCredential'
    email: string;
  }

export interface AuthCredentialSubject extends CredentialSubject {
    type: 'DemoAuthCredential'
    isAuthorized: true;
    userUuid: string;
    userEmail: string;
}

export interface KYCCredentialSubject extends CredentialSubject {
    type: 'KYCCredential',
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

export type ValidCredentialTypes = EmailCredentialSubject | AuthCredentialSubject | KYCCredentialSubject;

export const buildAuthCredentialSubject = (did: string, userUuid: string, userEmail: string): AuthCredentialSubject => ({
  type: 'DemoAuthCredential',
  id: did,
  isAuthorized: true,
  userUuid,
  userEmail
});

export const buildEmailCredentialSubject = (did: string, userEmail: string): EmailCredentialSubject => ({
  type: 'EmailCredential',
  id: did,
  email: userEmail
});

export const buildKYCCredentialSubject = (did: string, firstName: string): KYCCredentialSubject => ({
  type: 'KYCCredential',
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

// test credential types

// will be issued only by test issuer 1
export interface Test1ACredentialSubject extends CredentialSubject {
  type: 'Test1ACredential'
}

export interface Test1BCredentialSubject extends CredentialSubject {
  type: 'Test1BCredential'
}

// will be issued only by test issuer 2
export interface Test2ACredentialSubject extends CredentialSubject {
  type: 'Test2ACredential'
}

export interface Test2BCredentialSubject extends CredentialSubject {
  type: 'Test2BCredential'
}

// will not be issued by either test issuer
export interface Test3ACredentialSubject extends CredentialSubject {
  type: 'Test3ACredential'
}

export interface Test3BCredentialSubject extends CredentialSubject {
  type: 'Test3BCredential'
}

// will be issued by both test issuers
export interface Test4ACredentialSubject extends CredentialSubject {
  type: 'Test4ACredential'
}

export interface Test4BCredentialSubject extends CredentialSubject {
  type: 'Test4BCredential'
}

export type TestCredentialTypes =
  | Test1ACredentialSubject
  | Test1BCredentialSubject
  | Test2ACredentialSubject
  | Test2BCredentialSubject
  | Test3ACredentialSubject
  | Test3BCredentialSubject
  | Test4ACredentialSubject
  | Test4BCredentialSubject;

export const buildTest1ACredentialSubject = (did: string): Test1ACredentialSubject => ({
  type: 'Test1ACredential',
  id: did
});

export const buildTest1BCredentialSubject = (did: string): Test1BCredentialSubject => ({
  type: 'Test1BCredential',
  id: did
});
export const buildTest2ACredentialSubject = (did: string): Test2ACredentialSubject => ({
  type: 'Test2ACredential',
  id: did
});
export const buildTest2BCredentialSubject = (did: string): Test2BCredentialSubject => ({
  type: 'Test2BCredential',
  id: did
});

export const buildTest3ACredentialSubject = (did: string): Test3ACredentialSubject => ({
  type: 'Test3ACredential',
  id: did
});

export const buildTest3BCredentialSubject = (did: string): Test3BCredentialSubject => ({
  type: 'Test3BCredential',
  id: did
});

export const buildTest4ACredentialSubject = (did: string): Test4ACredentialSubject => ({
  type: 'Test4ACredential',
  id: did
});

export const buildTest4BCredentialSubject = (did: string): Test4BCredentialSubject => ({
  type: 'Test4BCredential',
  id: did
});

export const issueCredentialsHelper = async (
  issuerEntity: IssuerEntity,
  credentialSubject: string,
  credentialDataList: CredentialData[]
): Promise<UnumDto<CredentialPb[]>> => {
  let authCredentialResponse;

  try {
    authCredentialResponse = await issueCredentials(
      formatBearerToken(issuerEntity.authToken),
      issuerEntity.issuerDid,
      credentialSubject,
      credentialDataList,
      issuerEntity.privateKey
    );

    return authCredentialResponse as UnumDto<CredentialPb[]>;
  } catch (e) {
    logger.error(`issueCredentials caught an error thrown by the server sdk. ${e}`);
    throw e;
  }
};
