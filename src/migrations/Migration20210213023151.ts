import { Migration } from '@mikro-orm/migrations';

export class Migration20210213023151 extends Migration {
  async up (): Promise<void> {
    this.addSql('alter table "Issuer" add column "privateKey" text not null, add column "authToken" text not null;');
  }

  async down (): Promise<void> {
    this.addSql('alter table "Issuer" drop column "privateKey", drop column "authToken";');
  }
}
