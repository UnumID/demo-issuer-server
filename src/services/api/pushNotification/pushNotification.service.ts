import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import { PushNotificationService } from './pushNotification.class';

// add this service to the service type index;
declare module '../../../declarations' {
  interface ServiceTypes {
    pushNotification: PushNotificationService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  app.use('/pushNotification', new PushNotificationService(app));
}
