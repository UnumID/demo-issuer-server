import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { CredentialEntity } from '../../../entities/Credential';
import { hooks } from './userDid.hooks';
import { CredentialRequestService } from './userDid.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    credentialRequest: CredentialRequestService & ServiceAddons<CredentialEntity>;
  }
}

export default function (app: Application): void {
  app.use('/credentialRequest', new CredentialRequestService({}, app));
  const service = app.service('credentialRequest');
  service.hooks(hooks);
}
