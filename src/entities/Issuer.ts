import { Entity, Property } from '@mikro-orm/core';
import { Issuer } from '@unumid/types';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

interface IssuerEntityOptions extends BaseEntityOptions {
  data: Issuer;
}

@Entity({ tableName: 'Issuer' })
export class IssuerEntity extends BaseEntity {
  @Property()
  data: Issuer;

  constructor (options: IssuerEntityOptions) {
    super(options);

    this.data = options.data;
  }
}
