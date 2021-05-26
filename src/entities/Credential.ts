import { Entity, Property } from '@mikro-orm/core';
import { CredentialSubject, Proof, ProofPb } from '@unumid/types';

import { BaseEntity } from './BaseEntity';

export interface CredentialEntityOptions extends Partial<BaseEntity> {
  // credentialContext: string[];
  credentialContext: ['https://www.w3.org/2018/credentials/v1', ...string[]];
  credentialId: string;
  credentialCredentialSubject: CredentialSubject;
  credentialCredentialStatus: { id: string; type: string };
  credentialIssuer: string;
  credentialType: ['VerifiableCredential', ...string[]];
  // credentialType: string[];
  credentialIssuanceDate: Date;
  credentialExpirationDate?: Date;
  credentialProof: ProofPb;
  // credentialProof: Proof;
}

@Entity({ tableName: 'Credential' })
export class CredentialEntity extends BaseEntity {
  @Property({ columnType: 'uuid' })
  credentialId: string;

  @Property()
  credentialIssuer: string;

  @Property()
  credentialType: ['VerifiableCredential', ...string[]];
  // credentialType: string[];

  @Property()
  credentialContext: ['https://www.w3.org/2018/credentials/v1', ...string[]];
  // credentialContext: string[];

  @Property()
  credentialCredentialStatus: { id: string, type: string; };

  @Property()
  credentialCredentialSubject: CredentialSubject;

  @Property({ columnType: 'timestamptz(6)' })
  credentialIssuanceDate: Date;

  @Property({ columnType: 'timestamptz(6)' })
  credentialExpirationDate?: Date;

  @Property()
  credentialProof: ProofPb;
  // credentialProof: Proof;

  constructor (options: CredentialEntityOptions) {
    super(options);

    const {
      credentialId,
      credentialIssuer,
      credentialType,
      credentialContext,
      credentialCredentialStatus,
      credentialCredentialSubject,
      credentialIssuanceDate,
      credentialExpirationDate,
      credentialProof
    } = options;

    this.credentialId = credentialId;
    this.credentialIssuer = credentialIssuer;
    this.credentialType = credentialType;
    this.credentialContext = credentialContext;
    this.credentialCredentialStatus = credentialCredentialStatus;
    this.credentialCredentialSubject = credentialCredentialSubject;
    this.credentialIssuanceDate = credentialIssuanceDate;
    this.credentialExpirationDate = credentialExpirationDate;
    this.credentialProof = credentialProof;
  }
}
