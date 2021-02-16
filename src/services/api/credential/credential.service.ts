import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { CredentialService, CredentialResponseDto, CredentialListResponseDto } from './credential.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    credential: CredentialService & ServiceAddons<CredentialResponseDto | CredentialListResponseDto>;
  }
}

export default function (app: Application): void {
  app.use('/credential', new CredentialService({}, app));
}
