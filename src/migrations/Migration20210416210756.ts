import { Migration } from '@mikro-orm/migrations';

export class Migration20210416210756 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "PushToken" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "value" varchar(255) not null, "provider" text check ("provider" in (\'FCM\', \'APNS\')) not null, "user" varchar(255) not null);');
    this.addSql('alter table "PushToken" add constraint "PushToken_pkey" primary key ("uuid");');
    this.addSql('alter table "PushToken" add constraint "PushToken_value_unique" unique ("value");');

    this.addSql('alter table "PushToken" add constraint "PushToken_user_foreign" foreign key ("user") references "User" ("uuid") on update cascade;');

    this.addSql('drop table if exists "FcmRegistrationToken" cascade;');
  }

  async down (): Promise<void> {
    this.addSql('drop table "PushToken";');

    this.addSql('create table "FcmRegistrationToken" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "token" varchar(255) not null, "user" varchar(255) not null);');
    this.addSql('alter table "FcmRegistrationToken" add constraint "FcmRegistrationToken_pkey" primary key ("uuid");');
    this.addSql('alter table "FcmRegistrationToken" add constraint "FcmRegistrationToken_token_unique" unique ("token");');

    this.addSql('alter table "FcmRegistrationToken" add constraint "FcmRegistrationToken_user_foreign" foreign key ("user") references "User" ("uuid") on update cascade;');
  }
}
