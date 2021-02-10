
import { Options, EntityCaseNamingStrategy } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { config } from './config';
import { BaseEntity } from './entities/BaseEntity';
import { User } from './entities/User';
import { IssuerEntity, EmbeddedIssuer } from './entities/Issuer';

const mikroOrmConfig: Options = {
  baseDir: process.cwd(),
  type: 'postgresql',
  dbName: config.DB_NAME,
  host: config.DB_HOST,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
  user: config.DB_USER,
  entities: [
    BaseEntity,
    User,
    IssuerEntity,
    EmbeddedIssuer
  ],
  entitiesTs: ['src/entities'],
  metadataProvider: TsMorphMetadataProvider,
  tsNode: false,
  namingStrategy: EntityCaseNamingStrategy,
  migrations: {
    path: `${process.cwd()}/src/migrations`
  }
};

export default mikroOrmConfig;
