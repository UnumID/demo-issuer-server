import { Entity, Property, wrap } from '@mikro-orm/core';
import { omit } from 'lodash';

import { BaseEntity, BaseEntityOptions } from './BaseEntity';

export interface UserEntityOptions extends BaseEntityOptions {
  password: string;
  email: string;
  phone?: string;
  did?: string;
}

@Entity()
export class User extends BaseEntity {
  @Property({ unique: true })
  email: string;

  @Property()
  phone?: string;

  @Property()
  password: string;

  @Property()
  did?: string;

  constructor (options: UserEntityOptions) {
    super(options);

    const { email, phone, password, did } = options;

    this.email = email;
    this.phone = phone;
    this.password = password;
    this.did = did;
  }

  toJSON (ignoreFields?: string[]): Record<string, unknown> {
    const record = wrap(this).toObject(ignoreFields);
    return omit(record, 'password');
  }
}
