import createService, { Service as MikroOrmService } from 'feathers-mikro-orm';
import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { Device } from '../../entities/Device';

declare module '../../declarations' {
  interface ServiceTypes {
    deviceData: MikroOrmService<Device> & ServiceAddons<Device>;
  }
}

export default function (app: Application): void {
  const deviceDataService = createService({
    Entity: Device,
    orm: app.get('orm')
  });

  app.use('/deviceData', deviceDataService);
}
