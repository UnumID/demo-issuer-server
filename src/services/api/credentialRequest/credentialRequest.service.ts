import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { hooks } from './credentialRequest.hooks';
import { CredentialRequestService, CredentialsIssuedResponse } from './credentialRequest.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    credentialRequest: CredentialRequestService & ServiceAddons<CredentialsIssuedResponse>;
  }
}

export default function (app: Application): void {
  app.use('/credentialRequest', new CredentialRequestService({}, app));
  const service = app.service('credentialRequest');
  service.hooks(hooks);
}
