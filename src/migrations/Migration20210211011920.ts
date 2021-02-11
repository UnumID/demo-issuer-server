import { Migration } from '@mikro-orm/migrations';

export class Migration20210211011920 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "Credential" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "credential_context" jsonb not null, "credential_id" varchar(255) not null, "credential_credentialSubject" jsonb not null, "credential_credentialStatus" jsonb not null, "credential_issuer" varchar(255) not null, "credential_type" jsonb not null, "credential_issuanceDate" timestamptz(6) not null, "credential_expirationDate" timestamptz(6) null, "credential_proof" jsonb not null);');
    this.addSql('alter table "Credential" add constraint "Credential_pkey" primary key ("uuid");');
  }

  async down (): Promise<void> {
    this.addSql('drop table "Credential";');
  }
}
