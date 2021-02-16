import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { CredentialService } from './credential.class';
import { CredentialEntity } from '../../../entities/Credential';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    credential: CredentialService & ServiceAddons<CredentialEntity>;
  }
}

export default function (app: Application): void {
  app.use('/credential', new CredentialService({}, app));
}
