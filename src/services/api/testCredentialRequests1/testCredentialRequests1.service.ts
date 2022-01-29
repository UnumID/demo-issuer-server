import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { hooks } from './testCredentialRequests1.hooks';
import { TestCredentialRequests1Service } from './testCredentialRequests1.class';
import { CredentialsIssuedResponse } from '@unumid/types';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'test1/userCredentialRequests': TestCredentialRequests1Service & ServiceAddons<CredentialsIssuedResponse>;
  }
}

export default function (app: Application): void {
  app.use('/test1/userCredentialRequests', new TestCredentialRequests1Service(app));
  const service = app.service('test1/userCredentialRequests');
  service.hooks(hooks);
}
