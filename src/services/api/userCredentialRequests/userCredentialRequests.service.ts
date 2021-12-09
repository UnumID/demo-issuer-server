import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { hooks } from './userCredentialRequests.hooks';
import { UserCredentialRequestsService, CredentialsIssuedResponse } from './userCredentialRequests.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    userCredentialRequests: UserCredentialRequestsService & ServiceAddons<CredentialsIssuedResponse>;
  }
}

export default function (app: Application): void {
  app.use('/userCredentialRequests', new UserCredentialRequestsService({}, app));
  const service = app.service('userCredentialRequests');
  service.hooks(hooks);
}
