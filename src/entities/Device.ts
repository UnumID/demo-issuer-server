import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';
import { User } from './User';

interface DeviceCreateOptions extends Partial<BaseEntity> {
  user: User;
  fcmRegistrationToken: string;
}

@Entity()
export class Device extends BaseEntity {
  @Property({ unique: true })
  fcmRegistrationToken: string;

  @ManyToOne()
  user: User;

  constructor (options: DeviceCreateOptions) {
    super(options);

    this.fcmRegistrationToken = options.fcmRegistrationToken;
    this.user = options.user;
  }
}
