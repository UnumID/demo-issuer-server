import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { IssuerService } from './issuer.class';
import { IssuerEntity } from '../../../entities/Issuer';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    issuer: IssuerService & ServiceAddons<IssuerEntity>;
  }
}

export default function (app: Application): void {
  app.use('/issuer', new IssuerService({}, app));
}
