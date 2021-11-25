import { Params } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import logger from '../../../logger';
import { CredentialPb, SubjectCredentialRequest } from '@unumid/types';
import { SubjectCredentialRequestVerifiedStatus, UnumDto, verifySubjectCredentialRequests } from '@unumid/server-sdk';
import { IssuerEntity } from '../../../entities/Issuer';
import { User } from '../../../entities/User';
import { buildAuthCredentialSubject, buildEmailCredentialSubject, buildKYCCredentialSubject, issueCredentialsHelper, ValidCredentialTypes } from '../../../utils/credentials';
import { convertCredentialToCredentialEntityOptions } from '../../../utils/converters';

export type CredentialsIssuedResponse = {
  credentialTypesIssued: string[]
 };

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions {}

export class CredentialRequestService {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: SubjectCredentialRequest[], params?: Params): Promise<CredentialsIssuedResponse> {
    const issuer: IssuerEntity = params?.defaultIssuerEntity;

    const verification: UnumDto<SubjectCredentialRequestVerifiedStatus> = await verifySubjectCredentialRequests(issuer.authToken, issuer.issuerDid, data);

    if (!verification.body.isVerified) {
      logger.error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
      throw new Error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
    }

    // grab the user making the credential requests
    const userDataService = this.app.service('userData');
    const userDid: string = verification.body.subjectDid;
    let user: User;

    try {
      user = await userDataService.get(null, { where: { did: userDid } }); // will throw exception if not found
    } catch (e) {
      logger.warn(`No user found with did ${userDid}. No way to issue credentials`);
      throw e;
    }

    /**
     * Now that we have verified the credential requests have been all signed by the same subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store, we need some logic to determine if we can
     * issue the requested credentials.
     *
     * Because no real use case yet I am going just going to simply full fill email, kyc and auth credential requests.
     */
    const credentialSubjects: ValidCredentialTypes[] = [];
    data.forEach((credentialRequest: SubjectCredentialRequest) => {
      if (credentialRequest.type === 'EmailCredential') {
        credentialSubjects.push(buildEmailCredentialSubject(userDid, user.email));
      } else if (credentialRequest.type === 'AuthCredential') {
        credentialSubjects.push(buildAuthCredentialSubject(userDid, user.uuid, user.email));
      } else if (credentialRequest.type === 'KYCCredential') {
        credentialSubjects.push(buildKYCCredentialSubject(userDid, user.firstName as string));
      }
    });

    const issuerDto: UnumDto<CredentialPb[]> = await issueCredentialsHelper(issuer, userDid, credentialSubjects);

    // store the issued credentials
    const credentials: CredentialPb[] = issuerDto.body;
    const credentialDataService = this.app.service('credentialData');

    for (const issuedCredential of credentials) {
      const credentialEntityOptions = convertCredentialToCredentialEntityOptions(issuedCredential);

      try {
        await credentialDataService.create(credentialEntityOptions);
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by credentialDataService.create', e);
        throw e;
      }
    }

    // update the default issuer's auth token if it has been reissued
    if (issuerDto.authToken !== issuer.authToken) {
      const issuerDataService = this.app.service('issuerData');
      try {
        await issuerDataService.patch(issuer.uuid, { authToken: issuerDto.authToken });
      } catch (e) {
        logger.error('CredentialRequest create caught an error thrown by issuerDataService.patch', e);
        throw e;
      }
    }

    return {
      credentialTypesIssued: credentialSubjects.map((credentialSubject: ValidCredentialTypes) => credentialSubject.type)
    };
  }
}
