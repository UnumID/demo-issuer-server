import { Migration } from '@mikro-orm/migrations';

export class Migration20220114011226 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "User" add column "userCode" varchar(255) null;');
  }

  async down (): Promise<void> {
    this.addSql('alter table "User" drop column "userCode";');
  }
}
