import {
  Entity,
  Property,
  wrap,
  OneToMany,
  Collection
} from '@mikro-orm/core';
import { DemoUser, DemoUserCreateOptions } from '@unumid/demo-types';

import { BaseEntity } from './BaseEntity';
import { Device } from './Device';

type UserEntityOptions = DemoUserCreateOptions & Partial<BaseEntity>;

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

  @OneToMany({ entity: () => Device, mappedBy: 'user' })
  devices = new Collection<Device>(this);

  constructor (options: UserEntityOptions) {
    super(options);

    const { email, phone, password } = options;

    this.email = email;
    this.phone = phone;
    this.password = password;
  }

  toJSON (ignoreFields?: string[]): DemoUser {
    const record = wrap(this).toObject(ignoreFields);

    const result = {
      uuid: record.uuid,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      email: record.email,
      phone: record.phone,
      did: record.did,
      devices: record.devices
    };
    return result;
  }
}
