import { Migration } from '@mikro-orm/migrations';

export class Migration20210216033612 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "User" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "email" varchar(255) not null, "phone" varchar(255) null, "password" varchar(255) not null, "did" varchar(255) null);');
    this.addSql('alter table "User" add constraint "User_pkey" primary key ("uuid");');
    this.addSql('alter table "User" add constraint "User_email_unique" unique ("email");');

    this.addSql('create table "Issuer" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "privateKey" text not null, "authToken" text not null, "issuerUuid" uuid not null, "issuerCustomerUuid" uuid not null, "issuerDid" varchar(255) not null, "issuerCreatedAt" timestamptz(6) not null, "issuerUpdatedAt" timestamptz(6) not null, "issuerIsAuthorized" bool not null, "issuerName" varchar(255) not null);');
    this.addSql('alter table "Issuer" add constraint "Issuer_pkey" primary key ("uuid");');

    this.addSql('create table "Credential" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "credentialId" uuid not null, "credentialIssuer" varchar(255) not null, "credentialType" jsonb not null, "credentialContext" jsonb not null, "credentialCredentialStatus" jsonb not null, "credentialCredentialSubject" jsonb not null, "credentialIssuanceDate" timestamptz(6) not null, "credentialExpirationDate" timestamptz(6), "credentialProof" jsonb not null);');
    this.addSql('alter table "Credential" add constraint "Credential_pkey" primary key ("uuid");');
  }

  async down (): Promise<void> {
    this.addSql('drop table "User";');
    this.addSql('drop table "Issuer";');
    this.addSql('drop table "Credential";');
  }
}
