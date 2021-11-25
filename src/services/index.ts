import { Application } from '../declarations';
import userData from './data/user.data.service';
import issuerData from './data/issuer.data.service';
import credentialData from './data/credential.data.service';
import pushTokenData from './data/pushToken.data.service';
import user from './api/user/user.service';
import issuer from './api/issuer/issuer.service';
import credential from './api/credential/credential.service';
import credentialRequest from './api/credentialRequest/credentialRequest.service';
import pushToken from './api/pushToken/pushToken.service';
import pushNotification from './api/pushNotification/pushNotification.service';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function (app: Application): void {
  app.configure(userData);
  app.configure(issuerData);
  app.configure(credentialData);
  app.configure(credentialRequest);
  app.configure(pushTokenData);
  app.configure(user);
  app.configure(issuer);
  app.configure(credential);
  app.configure(pushToken);
  app.configure(pushNotification);
}
