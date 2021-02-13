import { Entity, Property, Embeddable, Embedded } from '@mikro-orm/core';
import { Issuer } from '@unumid/types';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

interface IssuerEntityOptions extends BaseEntityOptions {
  issuer: Issuer;
  privateKey: string;
  authToken: string;
}

@Embeddable()
export class EmbeddedIssuer implements Issuer {
  @Property()
  uuid: string;

  @Property()
  did: string;

  @Property()
  createdAt: string;

  @Property()
  updatedAt: string;

  @Property()
  name: string;

  @Property()
  isAuthorized: boolean;

  @Property()
  customerUuid: string;

  constructor (options: Issuer) {
    const {
      uuid,
      did,
      createdAt,
      updatedAt,
      name,
      isAuthorized,
      customerUuid
    } = options;

    this.uuid = uuid;
    this.did = did;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.name = name;
    this.isAuthorized = isAuthorized;
    this.customerUuid = customerUuid;
  }
}

@Entity({ tableName: 'Issuer' })
export class IssuerEntity extends BaseEntity {
  @Embedded()
  issuer: EmbeddedIssuer;

  @Property({ columnType: 'text' })
  privateKey: string;

  @Property({ columnType: 'text' })
  authToken: string;

  constructor (options: IssuerEntityOptions) {
    super(options);

    this.issuer = new EmbeddedIssuer(options.issuer);
    this.privateKey = options.privateKey;
    this.authToken = options.authToken;
  }
}
