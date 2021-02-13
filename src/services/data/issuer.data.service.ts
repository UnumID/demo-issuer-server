import createService, { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { IssuerEntity } from '../../entities/Issuer';

declare module '../../declarations' {
  interface ServiceTypes {
    issuerData: MikroOrmService<IssuerEntity> & ServiceAddons<IssuerEntity>;
  }
}

export default function (app: Application): void {
  const userDataService = createService({
    Entity: IssuerEntity,
    orm: app.get('orm')
  });

  app.use('/issuerData', userDataService);
}
