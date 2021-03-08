import { Property, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { DemoBaseEntity } from '@unumid/demo-types';

export abstract class BaseEntity implements DemoBaseEntity {
  @PrimaryKey()
  uuid: string;

  @Property({ columnType: 'timestamptz(6)' })
  createdAt: Date;

  @Property({ onUpdate: () => new Date(), columnType: 'timestamptz(6)' })
  updatedAt: Date;

  constructor (options: Partial<BaseEntity>) {
    const { uuid, createdAt, updatedAt } = options;

    this.uuid = uuid || v4();
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || this.createdAt;
  }
}
