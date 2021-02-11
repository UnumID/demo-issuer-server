import { Migration } from '@mikro-orm/migrations';

export class Migration20210210234250 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "Issuer" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "issuer_uuid" varchar(255) not null, "issuer_did" varchar(255) not null, "issuer_createdAt" varchar(255) not null, "issuer_updatedAt" varchar(255) not null, "issuer_name" varchar(255) not null, "issuer_isAuthorized" bool not null, "issuer_customerUuid" varchar(255) not null);');
    this.addSql('alter table "Issuer" add constraint "Issuer_pkey" primary key ("uuid");');
  }

  async down (): Promise<void> {
    this.addSql('drop table "Issuer";');
  }
}
