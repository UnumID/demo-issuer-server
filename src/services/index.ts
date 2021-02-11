import { Application } from '../declarations';
import userData from './data/user.data.service';
import issuerData from './data/issuer.data.service';
import credentialData from './data/credential.data.service';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function (app: Application): void {
  app.configure(userData);
  app.configure(issuerData);
  app.configure(credentialData);
}
