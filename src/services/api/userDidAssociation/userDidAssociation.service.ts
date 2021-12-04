import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { CredentialEntity } from '../../../entities/Credential';
import { hooks } from './userDidAssociation.hooks';
import { UserDidAssociationService } from './userDidAssociation.class';

// add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    userDidAssociation: UserDidAssociationService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  app.use('/userDidAssociation', new UserDidAssociationService({}, app));
  const service = app.service('userDidAssociation');
  service.hooks(hooks);
}
