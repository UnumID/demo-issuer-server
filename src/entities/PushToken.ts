import { Collection, Entity, Enum, ManyToMany, Property } from '@mikro-orm/core';
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

  @ManyToMany(() => User, user => user.pushTokens)
  users = new Collection<User>(this);

  constructor (options: PushTokenOptions) {
    super(options);

    console.log('PushToken constructor');
    console.log('options', options);

    this.value = options.value;
    this.users.add(options.user);
    this.provider = options.provider;
  }
}
