import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { hooks } from './testCredentialRequests2.hooks';
import { TestCredentialRequests2Service } from './testCredentialRequests2.class';
import { CredentialsIssuedResponse } from '@unumid/types';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'test2/userCredentialRequests': TestCredentialRequests2Service & ServiceAddons<CredentialsIssuedResponse>;
  }
}

export default function (app: Application): void {
  app.use('/test2/userCredentialRequests', new TestCredentialRequests2Service(app));
  const service = app.service('test2/userCredentialRequests');
  service.hooks(hooks);
}
