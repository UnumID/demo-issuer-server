import { Params } from '@feathersjs/feathers';
import { UnumDto, VerifiedStatus, verifySubjectCredentialRequests } from '@unumid/server-sdk';
import { CredentialPb, CredentialRequest } from '@unumid/types';

import { Application } from '../../../declarations';
import { IssuerEntity } from '../../../entities/Issuer';
import logger from '../../../logger';
import { convertCredentialToCredentialEntityOptions } from '../../../utils/converters';
import {
  buildTest1ACredentialSubject,
  buildTest1BCredentialSubject,
  buildTest4ACredentialSubject,
  buildTest4BCredentialSubject,
  issueCredentialsHelper,
  TestCredentialTypes
} from '../../../utils/credentials';
import { CredentialsIssuedResponse, UserCredentialRequests } from '../userCredentialRequests/userCredentialRequests.class';

/**
 * A service to use for testing more complex scenarios for the credential request/user code flow
 * (not really part of the ACME demo)
 * It will issue credentials of type 'Test1ACredential' and 'Test1BCredential' on request
 * and will refuse to issue credentials of type 'Test2ACredential' and 'Test2BCredential'
 */
export class TestCredentialRequests1Service {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  async create (data: UserCredentialRequests, params?: Params): Promise<CredentialsIssuedResponse> {
    const issuer: IssuerEntity = params?.issuerEntity;

    const { user, credentialRequestsInfo: { subjectCredentialRequests, issuerDid, subjectDid } } = data;

    if (issuer.issuerDid !== issuerDid) {
      throw new Error(`Persisted Issuer DID ${issuer.issuerDid} does not match request's issuer did ${issuerDid}`);
    }

    const verification: UnumDto<VerifiedStatus> = await verifySubjectCredentialRequests(issuer.authToken, issuer.issuerDid, subjectDid, subjectCredentialRequests);

    if (!verification.body.isVerified) {
      logger.error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
      throw new Error(`SubjectCredentialRequests could not be validated. Not issuing credentials. ${verification.body.message}`);
    }

    // Note in the userDidAssociation hook we have already ensured that the user has an associated did.
    const userDid = user.did as string;

    /**
     * Now that we have verified the credential requests signature signed by the subject, aka user, and we
     * have confirmed to have a user with the matching did in our data store, we need some logic to determine if we can
     * issue the requested credentials.
     *
     * For demonstration purposes just simply full-filling email, kyc and auth credential requests.
     */
    const credentialSubjects: TestCredentialTypes[] = [];
    subjectCredentialRequests.credentialRequests.forEach((credentialRequest: CredentialRequest) => {
      // This test issuer issues four types of credentials on request, Test1A, Test1B, Test4A and Test4B
      // It does not issue credentials of type Test2A, Test2B, Test3A, or Test3B
      switch (credentialRequest.type) {
        case 'Test1ACredential': {
          credentialSubjects.push(buildTest1ACredentialSubject(userDid));
          break;
        }
        case 'Test1BCredential': {
          credentialSubjects.push(buildTest1BCredentialSubject(userDid));
          break;
        }
        case 'Test2ACredential': {
          logger.info('Test Issuer 1 does not issue Test2ACredential');
          break;
        }
        case 'Test2BCredential': {
          logger.info('Test Issuer 1 does not issue Test2BCredential');
          break;
        }
        case 'Test3ACredential': {
          logger.info('Test Issuer 1 does not issue Test3ACredential');
          break;
        }
        case 'Test3BCredential': {
          logger.info('Test Issuer 1 does not issue Test3BCredential');
          break;
        }
        case 'Test4ACredential': {
          credentialSubjects.push(buildTest4ACredentialSubject(userDid));
          break;
        }
        case 'Test4BCredential': {
          credentialSubjects.push(buildTest4BCredentialSubject(userDid));
          break;
        }
        default: {
          logger.info(`Test Issuer 1 received unexpected request for ${credentialRequest.type}`);
        }
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
      credentialTypesIssued: credentialSubjects.map((credentialSubject: TestCredentialTypes) => credentialSubject.type)
    };
  }
}
