import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { IssuerService } from './issuer.class';
import { IssuerEntity } from '../../../entities/Issuer';
import { hooks } from './issuer.hooks';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    issuer: IssuerService & ServiceAddons<IssuerEntity>;
  }
}

export default function (app: Application): void {
  app.use('/issuer', new IssuerService({}, app));
  const service = app.service('issuer');
  service.hooks(hooks);
}
