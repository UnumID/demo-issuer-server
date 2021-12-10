import { Params, Service } from '@feathersjs/feathers';

import { Application } from '../../../declarations';
import logger from '../../../logger';
import { CredentialPb, Issuer, SubjectCredentialRequest, SubjectCredentialRequestsDto, SubjectCredentialRequestsEnrichedDto } from '@unumid/types';
import { SubjectCredentialRequestVerifiedStatus, UnumDto, VerifiedStatus, verifySubjectCredentialRequests, verifySubjectDidDocument } from '@unumid/server-sdk';
import { IssuerEntity } from '../../../entities/Issuer';
import { User } from '../../../entities/User';
import { buildAuthCredentialSubject, buildEmailCredentialSubject, buildKYCCredentialSubject, issueCredentialsHelper, ValidCredentialTypes } from '../../../utils/credentials';
import { convertCredentialToCredentialEntityOptions } from '../../../utils/converters';

export type CredentialsIssuedResponse = {
  credentialTypesIssued: string[]
 };

export interface UserCredentialRequests extends SubjectCredentialRequestsEnrichedDto {
  user: User;
}

/**
 * A class to handle SubjectCredentialRequests and issue credentials accordingly, all verification permitting.
 */
export class UserCredentialRequestsService {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  async create (data: UserCredentialRequests, params?: Params): Promise<CredentialsIssuedResponse> {
    const issuer: IssuerEntity = params?.defaultIssuerEntity;

    const { user, credentialRequestsInfo: { credentialRequests, issuerDid, subjectDid } } = data;

    if (issuer.issuerDid !== issuerDid) {
      throw new Error(`Persisted Issuer DID ${issuer.issuerDid} does not match request's issuer did ${issuerDid}`);
    }

    const verification: UnumDto<SubjectCredentialRequestVerifiedStatus> = await verifySubjectCredentialRequests(issuer.authToken, issuer.issuerDid, credentialRequests);

    if (!verification.body.isVerified) {
      logger.error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
      throw new Error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
    }

    // Note in the userDidAssociation hook we have already ensured that the user has an associated did.
    const userDid = user.did as string;

    /**
     * Now that we have verified the credential requests have been all signed by the same subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store, we need some logic to determine if we can
     * issue the requested credentials.
     *
     * Because no real use case yet I am going just going to simply full fill email, kyc and auth credential requests.
     */
    const credentialSubjects: ValidCredentialTypes[] = [];
    credentialRequests.forEach((credentialRequest: SubjectCredentialRequest) => {
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
