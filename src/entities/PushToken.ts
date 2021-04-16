import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import {
  pushProviders,
  PushProvider
} from '@unumid/types';

import { BaseEntity } from './BaseEntity';
import { User } from './User';

export interface PushTokenOptions extends Partial<BaseEntity> {
  user: User;
  provider: PushProvider;
  value: string;
}

@Entity()
export class PushToken extends BaseEntity {
  @Property({ unique: true })
  value: string;

  @Enum({ items: [...pushProviders] })
  provider: PushProvider;

  @ManyToOne()
  user: User;

  constructor (options: PushTokenOptions) {
    super(options);

    this.value = options.value;
    this.user = options.user;
    this.provider = options.provider;
  }
}
