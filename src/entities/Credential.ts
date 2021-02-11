import { Entity, Property, Embeddable, Embedded } from '@mikro-orm/core';
import { Credential, CredentialSubject, Proof } from '@unumid/types';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';
import { Rename } from '../types';

export interface CredentialEntityOptions extends BaseEntityOptions {
  credential: Credential
}

@Embeddable()
export class EmbeddedCredential implements Rename<Credential, '@context', 'context'> {
  @Property({ serializedName: '@context' })
  context: ['https://www.w3.org/2018/credentials/v1', ...string[]];

  @Property()
  id: string;

  @Property()
  credentialSubject: CredentialSubject;

  @Property()
  credentialStatus: { id: string, type: string };

  @Property()
  issuer: string;

  @Property()
  type: ['VerifiableCredential', ...string[]];

  @Property({ columnType: 'timestamptz(6)' })
  issuanceDate: Date;

  @Property({ columnType: 'timestamptz(6)' })
  expirationDate?: Date;

  @Property()
  proof: Proof;

  constructor (options: Credential) {
    const {
      credentialSubject,
      credentialStatus,
      issuer,
      type,
      id,
      issuanceDate,
      expirationDate,
      proof
    } = options;

    this.context = options['@context'];
    this.credentialStatus = credentialStatus;
    this.credentialSubject = credentialSubject;
    this.issuer = issuer;
    this.type = type;
    this.id = id;
    this.issuanceDate = issuanceDate;
    this.expirationDate = expirationDate;
    this.proof = proof;
  }
}

@Entity({ tableName: 'Credential' })
export class CredentialEntity extends BaseEntity {
  @Embedded()
  credential: EmbeddedCredential;

  constructor (options: CredentialEntityOptions) {
    super(options);

    this.credential = new EmbeddedCredential(options.credential);
  }
}
