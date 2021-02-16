import { Entity, Property } from '@mikro-orm/core';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

export interface IssuerEntityOptions extends BaseEntityOptions {
  issuerUuid: string;
  issuerDid: string;
  issuerCreatedAt: Date;
  issuerUpdatedAt: Date;
  issuerName: string;
  issuerIsAuthorized: boolean;
  issuerCustomerUuid: string;
  privateKey: string;
  authToken: string;
}

@Entity({ tableName: 'Issuer' })
export class IssuerEntity extends BaseEntity {
  @Property({ columnType: 'text' })
  privateKey: string;

  @Property({ columnType: 'text' })
  authToken: string;

  @Property({ columnType: 'uuid' })
  issuerUuid: string;

  @Property({ columnType: 'uuid' })
  issuerCustomerUuid: string;

  @Property()
  issuerDid: string;

  @Property({ columnType: 'timestamptz(6)' })
  issuerCreatedAt: Date;

  @Property({ columnType: 'timestamptz(6)' })
  issuerUpdatedAt: Date;

  @Property()
  issuerIsAuthorized: boolean;

  @Property()
  issuerName: string;

  constructor (options: IssuerEntityOptions) {
    super(options);

    const {
      privateKey,
      authToken,
      issuerUuid,
      issuerCustomerUuid,
      issuerDid,
      issuerCreatedAt,
      issuerUpdatedAt,
      issuerIsAuthorized,
      issuerName
    } = options;

    this.privateKey = privateKey;
    this.authToken = authToken;
    this.issuerUuid = issuerUuid;
    this.issuerCustomerUuid = issuerCustomerUuid;
    this.issuerCreatedAt = issuerCreatedAt;
    this.issuerUpdatedAt = issuerUpdatedAt;
    this.issuerIsAuthorized = issuerIsAuthorized;
    this.issuerName = issuerName;
    this.issuerDid = issuerDid;
  }
}
