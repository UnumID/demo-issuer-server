import {
  Entity,
  Property,
  Collection,
  ManyToMany
} from '@mikro-orm/core';
import { DemoUserCreateOptions } from '@unumid/demo-types';

import { BaseEntity } from './BaseEntity';
import { PushToken } from './PushToken';

type UserEntityOptions = DemoUserCreateOptions & Partial<BaseEntity>;

@Entity()
export class User extends BaseEntity {
  @Property({ unique: true })
  email: string;

  @Property()
  phone?: string;

  @Property({ hidden: true })
  password: string;

  @Property()
  did?: string;

  @Property()
  firstName?: string;

  @ManyToMany(() => PushToken, 'users', { owner: true })
  pushTokens = new Collection<PushToken>(this);

  constructor (options: UserEntityOptions) {
    super(options);

    const { email, phone, password, firstName } = options;

    this.email = email;
    this.phone = phone;
    this.password = password;
    this.firstName = firstName;
  }
}
