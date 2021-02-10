import { Migration } from '@mikro-orm/migrations';

export class Migration20210210184624 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "Issuer" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "data" jsonb not null);');
    this.addSql('alter table "Issuer" add constraint "Issuer_pkey" primary key ("uuid");');
  }

  async down (): Promise<void> {
    this.addSql('drop table "Issuer";');
  }
}
