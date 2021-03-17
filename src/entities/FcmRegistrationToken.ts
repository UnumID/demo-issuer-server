import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';
import { User } from './User';

interface FcmRegistrationTokenOptions extends Partial<BaseEntity> {
  user: User;
  token: string;
}

@Entity()
export class FcmRegistrationToken extends BaseEntity {
  @Property({ unique: true })
  token: string;

  @ManyToOne()
  user: User;

  constructor (options: FcmRegistrationTokenOptions) {
    super(options);

    this.token = options.token;
    this.user = options.user;
  }
}
