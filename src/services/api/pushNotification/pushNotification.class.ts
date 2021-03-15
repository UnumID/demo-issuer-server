import { Application } from '../../../declarations';
import logger from '../../../logger';

export class PushNotificationService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  async create (data: any): Promise<any> {
    console.log('PushNotificationService.create', data);
  }
}
