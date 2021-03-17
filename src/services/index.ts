import { Application } from '../declarations';
import userData from './data/user.data.service';
import issuerData from './data/issuer.data.service';
import credentialData from './data/credential.data.service';
import fcmRegistrationTokenData from './data/fcmRegistrationToken.data.service';
import user from './api/user/user.service';
import issuer from './api/issuer/issuer.service';
import credential from './api/credential/credential.service';
import fcmRegistrationToken from './api/fcmRegistrationToken/fcmRegistrationToken.service';
import pushNotification from './api/pushNotification/pushNotification.service';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function (app: Application): void {
  app.configure(userData);
  app.configure(issuerData);
  app.configure(credentialData);
  app.configure(fcmRegistrationTokenData);
  app.configure(user);
  app.configure(issuer);
  app.configure(credential);
  app.configure(fcmRegistrationToken);
  app.configure(pushNotification);
}
