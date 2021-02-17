import { Migration } from '@mikro-orm/migrations';

export class Migration20210216172235 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "Issuer" add column "apiKey" varchar(255) not null;');
  }

  async down (): Promise<void> {
    this.addSql('alter table "Issuer" drop column "apiKey";');
  }
}
