import createService, { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { CredentialEntity } from '../../entities/Credential';

declare module '../../declarations' {
  interface ServiceTypes {
    credentialData: MikroOrmService & ServiceAddons<CredentialEntity>;
  }
}

export default function (app: Application): void {
  const userDataService = createService({
    Entity: CredentialEntity,
    name: 'CredentialEntity',
    orm: app.get('orm')
  });

  app.use('credentialData', userDataService);
}
