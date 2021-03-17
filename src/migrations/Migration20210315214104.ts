import { Migration } from '@mikro-orm/migrations';

export class Migration20210315214104 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "Device" ("uuid" varchar(255) not null, "createdAt" timestamptz(6) not null, "updatedAt" timestamptz(6) not null, "fcmRegistrationToken" varchar(255) not null, "user" varchar(255) not null);');
    this.addSql('alter table "Device" add constraint "Device_pkey" primary key ("uuid");');
    this.addSql('alter table "Device" add constraint "Device_fcmRegistrationToken_unique" unique ("fcmRegistrationToken");');

    this.addSql('alter table "Device" add constraint "Device_user_foreign" foreign key ("user") references "User" ("uuid") on update cascade;');
  }

  async down (): Promise<void> {
    this.addSql('drop table "Device";');
  }
}
