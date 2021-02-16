import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { IssuerService, IssuerResponseDto, IssuerListResponseDto } from './issuer.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    issuer: IssuerService & ServiceAddons<IssuerResponseDto | IssuerListResponseDto>;
  }
}

export default function (app: Application): void {
  app.use('/issuer', new IssuerService({}, app));
}
