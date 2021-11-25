import { ServiceAddons } from '@feathersjs/feathers';
import { CredentialRequest } from '@unumid/types/build/protos/credential';

import { Application } from '../../../declarations';
import { CredentialEntity } from '../../../entities/Credential';
import { hooks } from './credentialRequest.hooks';
import { CredentialRequestService } from './credentialRequest.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    credentialRequest: CredentialRequestService & ServiceAddons<CredentialEntity>;
  }
}

export default function (app: Application): void {
  app.use('/credentialRequest', new CredentialRequestService({}, app));
  const service = app.service('credentialRequest');
  // app.use('/user', new UserService({}, app));
  // const service = app.service('user');
  service.hooks(hooks);
}
