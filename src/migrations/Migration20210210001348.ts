import { Migration } from '@mikro-orm/migrations';

export class Migration20210210001348 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "User" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "email" varchar(255) not null, "phone" varchar(255) null, "password" varchar(255) not null, "did" varchar(255) null);');
    this.addSql('alter table "User" add constraint "User_pkey" primary key ("uuid");');
    this.addSql('alter table "User" add constraint "User_email_unique" unique ("email");');
  }

  async down (): Promise<void> {
    this.addSql('drop table "User";');
  }
}
