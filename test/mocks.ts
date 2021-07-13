import { CredentialPb, Issuer } from '@unumid/types';

import { convertCredentialSubject, UnumDto } from '@unumid/server-sdk';
import { v4 } from 'uuid';

import { CredentialEntity } from '../src/entities/Credential';

import { IssuerEntity } from '../src/entities/Issuer';
import { User } from '../src/entities/User';

export const dummyCredentialSubject = {
  id: 'did:unum:54ca4b1f-fe7e-43ce-a4e4-8ec178f16a65',
  firstName: 'Wile',
  middleInitial: 'E.',
  lastName: 'Coyote',
  username: 'Central-value-added-908',
  ssn4: 4321,
  contactInformation: {
    emailAddress: 'AnvilAvoider@gmail.com',
    phoneNumber: '1234567890',
    homeAddress: {
      line1: '98765 Runner Rd.',
      city: 'Desert',
      state: 'AZ',
      zip: 12345,
      country: 'United States'
    }
  },
  driversLicense: {
    state: 'AZ',
    number: 'n-123456789',
    expiration: '2026-01-14T00:00:00.000Z'
  },
  accounts: {
    checking: {
      accountNumber: '543888430912',
      routingNumber: '021000021'
    }
  },
  confidence: '99%'
};

export const dummyCredentialV3: CredentialPb = {
  context: [
    'https://www.w3.org/2018/credentials/v1'
  ],
  credentialStatus: {
    id: 'https://api.dev-unumid.org//credentialStatus/9e90a492-3360-4beb-b3ca-e8eff1ec6e2a',
    type: 'CredentialStatus'
  },
  credentialSubject: JSON.stringify(dummyCredentialSubject),
  issuer: 'did:unum:2e05967f-216f-44c4-ae8e-d6f71cd17c5a',
  type: [
    'VerifiableCredential',
    'BankIdentityCredential'
  ],
  id: '9e90a492-3360-4beb-b3ca-e8eff1ec6e2a',
  issuanceDate: new Date('2021-02-08T21:18:23.403Z'),
  expirationDate: new Date('2022-02-08T00:00:00.000Z'),
  proof: {
    created: new Date('2021-02-08T21:18:23.403Z'),
    signatureValue: 'iKx1CJMheLAPr3H1T4TDH13h7xTVeunAhTy6ochNjxteHbb7X7J951idkvR8ZCxfvoz85JHwTpiNXFBYUB842UhWcTCS4JEhcf',
    type: 'secp256r1Signature2020',
    verificationMethod: 'did:unum:2e05967f-216f-44c4-ae8e-d6f71cd17c5a',
    proofPurpose: 'AssertionMethod'
  }
};

export const dummyCredentialEntityOptionsV3 = {
  credentialContext: dummyCredentialV3.context as ['https://www.w3.org/2018/credentials/v1', ...string[]],
  credentialCredentialStatus: dummyCredentialV3.credentialStatus,
  credentialCredentialSubject: convertCredentialSubject(dummyCredentialV3.credentialSubject),
  credentialId: dummyCredentialV3.id,
  credentialIssuer: dummyCredentialV3.issuer,
  credentialType: dummyCredentialV3.type as ['VerifiableCredential', ...string[]],
  credentialIssuanceDate: dummyCredentialV3.issuanceDate,
  credentialExpirationDate: dummyCredentialV3.expirationDate,
  credentialProof: dummyCredentialV3.proof
};

export const dummyCredentialEntityV3 = new CredentialEntity(dummyCredentialEntityOptionsV3);
export const dummyCredentialEntity2V3 = new CredentialEntity(dummyCredentialEntityOptionsV3);

export const dummyUser = new User({
  email: 'test@unumid.org',
  password: 'test',
  firstName: 'test'
});

export const dummyUser2 = new User({
  email: 'test2@unumid.org',
  password: 'test',
  firstName: 'test'
});

const now = new Date().toISOString();

export const dummyIssuer: Issuer = {
  uuid: v4(),
  createdAt: new Date(now),
  updatedAt: new Date(now),
  did: `did:unum:${v4()}`,
  name: 'test issuer',
  customerUuid: v4(),
  isAuthorized: true
};

export const dummyIssuerEntityOptions = {
  issuerUuid: dummyIssuer.uuid,
  issuerCreatedAt: new Date(dummyIssuer.createdAt),
  issuerUpdatedAt: new Date(dummyIssuer.updatedAt),
  issuerDid: dummyIssuer.did,
  issuerName: dummyIssuer.name,
  issuerCustomerUuid: dummyIssuer.customerUuid,
  issuerIsAuthorized: dummyIssuer.isAuthorized,
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgacp2BLU+IxZYJopo\nGBTF0J2jvWY+EvS5fdlexMnjKoahRANCAASGXgT4l1h1JZaMPpdCp/QCcyfQbtPM\nSIuYeKYilXESM0UsTEYIvFNdzw32sUqYOPL5r8hPzp3nrSqKfT/C+yoQ\n-----END PRIVATE KEY-----\n',
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiaXNzdWVyIiwidXVpZCI6Ijk1ZWI5YzFhLTQ0ZTgtNGE5ZS1hNzFhLWNjNTNiNjJiMjRhMiIsImRpZCI6ImRpZDp1bnVtOjZkYjA3NThmLWEwYTUtNDI4MC1hYWI2LTg1NTY5NzI1MjVjYiIsImV4cCI6MTYxMzA3MTIyMS40MDIsImlhdCI6MTYxMzE4MjQ3NX0.GZZE3H9NcOVOhENnNlECVDkW1bEKBZofgw6PK_-jchM',
  apiKey: '8xPB+vv3e5LwT6H6IBa33FAVHiqJQTwuj4k6R+a3w90='
};

export const dummyIssuerEntity = new IssuerEntity(dummyIssuerEntityOptions);

export const dummyIssuerEntity2 = new IssuerEntity(dummyIssuerEntityOptions);

export const dummyCredentialDto: UnumDto<CredentialPb> = {
  body: {
    ...dummyCredentialV3,
    credentialSubject: dummyCredentialV3.credentialSubject
  },
  authToken: dummyIssuerEntityOptions.authToken
};
