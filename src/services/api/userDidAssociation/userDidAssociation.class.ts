import { Params } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import logger from '../../../logger';
import { UserDidAssociation } from '@unumid/types';
import { UnumDto, VerifiedStatus, verifySubjectDidDocument } from '@unumid/server-sdk';
import { IssuerEntity } from '../../../entities/Issuer';
import { User } from '../../../entities/User';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions {}

/**
 * A class for handling the association of a user with a DID.
 * Note: this setup would be an example of this customer using UnumID's wallet, not a mobile app of their own the Holder SDK.
 */
export class UserDidAssociationService {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: UserDidAssociation, params?: Params): Promise<User> {
    const { userIdentifier, subjectDidDocument } = data;
    const issuer: IssuerEntity = params?.defaultIssuerEntity;

    // need to ensure we have the userId
    const userDataService = this.app.service('userData');
    let user: User;

    try {
      user = await userDataService.get(userIdentifier); // will throw exception if not found
    } catch (e) {
      logger.warn(`No user found with id ${userIdentifier}. Can not associate the did ${subjectDidDocument.id}.`);
      throw e;
    }

    // verify the subject did document
    const result: UnumDto<VerifiedStatus> = await verifySubjectDidDocument(issuer.authToken, issuer.issuerDid, subjectDidDocument);

    if (!result.body.isVerified) {
      throw new Error(`${result.body.message} Subject DID document ${subjectDidDocument.id} for user ${userIdentifier} is not verified.`);
    }

    const userDid = subjectDidDocument.id;

    await userDataService.patch(userIdentifier, { did: userDid });

    // update the default issuer's auth token if it has been reissued
    if (result.authToken !== issuer.authToken) {
      const issuerDataService = this.app.service('issuerData');
      try {
        await issuerDataService.patch(issuer.uuid, { authToken: result.authToken });
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by issuerDataService.patch', e);
        throw e;
      }
    }

    return user;
  }
}
