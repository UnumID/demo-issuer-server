import { Migration } from '@mikro-orm/migrations';

export class Migration20210825223413 extends Migration {
  async up (): Promise<void> {
    this.addSql('create table "User_pushTokens" ("user" varchar(255) not null, "pushToken" varchar(255) not null);');
    this.addSql('alter table "User_pushTokens" add constraint "User_pushTokens_pkey" primary key ("user", "pushToken");');

    this.addSql('alter table "User_pushTokens" add constraint "User_pushTokens_user_foreign" foreign key ("user") references "User" ("uuid") on update cascade on delete cascade;');
    this.addSql('alter table "User_pushTokens" add constraint "User_pushTokens_pushToken_foreign" foreign key ("pushToken") references "PushToken" ("uuid") on update cascade on delete cascade;');

    this.addSql('insert into "User_pushTokens" ("user", "pushToken") select "user", "uuid" from "PushToken";');

    this.addSql('alter table "PushToken" drop constraint "PushToken_user_foreign";');
    this.addSql('alter table "PushToken" drop column "user";');
  }

  async down (): Promise<void> {
    this.addSql('alter table "PushToken" add column "user" varchar(255);');
    this.addSql('alter table "PushToken" add constraint "PushToken_user_foreign" foreign key ("user") references "User" ("uuid") on update cascade on delete cascade;');

    this.addSql('update "PushToken" set "user" = "User_pushTokens"."user" from "User_pushTokens" where "User_pushTokens"."pushToken" = "PushToken"."uuid";');

    this.addSql('alter table "PushToken" alter column "user" set not null;');

    this.addSql('drop table "User_pushTokens";');
  }
}
