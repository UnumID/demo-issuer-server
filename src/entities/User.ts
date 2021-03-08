import { Entity, Property, wrap } from '@mikro-orm/core';
import { omit } from 'lodash';
import { DemoUser, DemoUserCreateOptions } from '@unumid/demo-types';

import { BaseEntity } from './BaseEntity';

type UserEntityOptions = DemoUserCreateOptions & Partial<BaseEntity>;

@Entity()
export class User extends BaseEntity implements DemoUser {
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

    const { email, phone, password } = options;

    this.email = email;
    this.phone = phone;
    this.password = password;
  }

  toJSON (ignoreFields?: string[]): Record<string, unknown> {
    const record = wrap(this).toObject(ignoreFields);
    return omit(record, 'password');
  }
}
