import { Migration } from '@mikro-orm/migrations';

export class Migration20210513015314 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "User" add column "firstName" varchar(255) null;');

    this.addSql('update "User" set "firstName" = (regexp_match("User"."email", \'^[^@\\.\\+]*\'))[1]');
  }

  async down (): Promise<void> {
    this.addSql('alter table "User" drop column "firstName";');
  }
}
