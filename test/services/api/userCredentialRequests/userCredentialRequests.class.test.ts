import { PushNotificationService } from '../../../../src/services/api/pushNotification/pushNotification.class';
import { sendPushNotification } from '../../../../src/utils/sendPushNotification';
import { dummyUser } from '../../../mocks';
import { Application } from '../../../../src/declarations';
import { UserCredentialRequestsService } from '../../../../src/services/api/userCredentialRequests/userCredentialRequests.class';
import { HookContext } from '@feathersjs/feathers';
import { handleUserDidAssociation } from '../../../../src/services/api/userCredentialRequests/userCredentialRequests.hooks';
import { verifyDidDocument } from '@unumid/server-sdk/build/utils/verifyDidDocument';
import * as serverSdk from '@unumid/server-sdk';
import { UserService } from '../../../../src/services/api/user/user.class';

jest.mock('../../../../src/utils/sendPushNotification');

const data = {
  userDidAssociation: {
    userIdentifier: 'c9b5371f-dd4a-4215-a820-c654d8181369',
    subjectDidDocument: {
      '@context': [
        'https://www.w3.org/ns/did/v1'
      ],
      id: '{{acmeSubjectDid}}',
      created: '2020-07-01T21:39:49.814Z',
      updated: '2020-07-01T21:39:49.814Z',
      publicKey: [
        {
          id: '25ce5406-b4ee-46d4-bf81-49f7523b6436',
          type: 'secp256r1',
          status: 'valid',
          encoding: 'pem',
          publicKey: '-----BEGIN PUBLIC KEY-----MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEMxe+qHW8IyDU3V7qQHhjNhDoPPDTPC6NZ1YHQmYh+u/yKIZwobM95pZGLkyNPXPCAQ9UQ8KzP3o4++0ulkTa+Q==-----END PUBLIC KEY-----',
          createdAt: '2020-07-01T21:39:49.814Z',
          updatedAt: '2020-07-01T21:39:49.814Z'
        },
        {
          id: '81bf1780-ef09-4e37-b29f-698f959ca116',
          type: 'RSA',
          status: 'valid',
          encoding: 'pem',
          publicKey: '----BEGIN RSA PUBLIC KEY-----MIIBCgKCAQEAnysXTrcIMtsBpMTDlUvNHttZibQ8Nu2oZeKBbpW1yOzZ+NwqwkgXRjrH1bPWi7NuZcGHQCrkXYuX6WOpRh1eXEsRNDjd3emPH5UgMO9o5Xle55fhl6N64bDRbraDBKvPQypG6Uio1YIh+FC/vNk+j1rZODdbhkDQttv4NUofCmpww7XfX9qrkvZ86QotuBkVDXW1/1Q6IahjZ+gCOYTh6WqjeB5MZv75SGrf0Ly/Op6Eoz93PLgliMv5fC/5xLEev+eoLp6gmin3nLvaNsurCDeLy2hUNbas/Q1GqEBeX4Mk638g +AS9lIGcW59kN0Ui7cdLIi8GBlayihtdBZoySQIDAQAB-----END RSA PUBLIC KEY-----',
          createdAt: '2020-07-01T21:39:49.814Z',
          updatedAt: '2020-07-01T21:39:49.814Z'
        }
      ],
      service: [
        {
          id: 'did:unum:f2c5461c-1b9f-44d4-b935-480c6b7fe372#vcr',
          type: 'CredentialRepositoryService',
          serviceEndpoint: 'https://api.dev-unumid.org/credentialRepository/did:unum:f2c5461c-1b9f-44d4-b935-480c6b7fe372'
        }
      ],
      proof: { created: '2021-12-09T17:15:47.881Z', signatureValue: 'AN1rKrWgwmXoMV5Hwkr2uow628TPFrw8M7aXBWMkr4g2z51tc2SjbmMHPhqCbjKq2dCwFYqRxECN8mcNgHcDxKDbaWAv7E1aF', type: 'secp256r1Signature2020', verificationMethod: 'did:unum:00e1691b-437e-4096-93d8-0ca523d7d2c9', proofPurpose: 'assertionMethod' }
    }
  },
  credentialRequestsInfo: {
    credentialRequests: [
      {
        type: 'KYCCredential',
        issuers: [
          'did:unum:6ff79cd5-3088-4d69-82b4-4e0b7bbcf3b2'
        ],
        required: true,
        proof: {
          created: '2021-12-09T17:14:45.637Z',
          signatureValue: 'iKx1CJP3JCGKDDQbGscWxjTtE7sQMLAiHK981Qq8Zu5j7Gxkrv3xYxDazFxLu89yRHGmGaLUsKxuN1ruqr8V1ERwHqCSn7mWCv',
          type: 'secp256r1Signature2020',
          verificationMethod: 'did:unum:b636fd90-c0f8-429a-a0b4-0d640f76d780',
          proofPurpose: 'AssertionMethod'
        }
      }
    ],
    issuerDid: 'did:unum:6ff79cd5-3088-4d69-82b4-4e0b7bbcf3b2',
    subjectDid: 'did:unum:118f2cc0-9f4b-42c3-8074-a195f8ee1576'
  }
};

describe('UserCredentialRequestsService', () => {
  it('todo', () => {
    expect(true).toBe(true);
  });
  //   let service: UserService;

  //   const mockUserDataService = {
  //     get: jest.fn(),
  //     find: jest.fn(),
  //     create: jest.fn(),
  //     patch: jest.fn(),
  //     remove: jest.fn()
  //   };

  //   beforeEach(async () => {
  //     const app = {
  //       service: () => {
  //         return mockUserDataService;
  //       }
  //     };

  //     // service = new UserService({}, app as unknown as Application);
  //   });

  //   describe('create', () => {
  //     it('validates options for receipts of type CredentialIssued', () => {
  //       const ctx = { data } as HookContext;
  //       mockUserDataService.get.mockResolvedValueOnce(dummyUser);
  //       const spy = jest.spyOn(serverSdk, 'verifySubjectDid');
  //       handleUserDidAssociation(ctx);

  //       // expect(verifyDidDocument).toBeCalled();
  //       expect(spy).toHaveBeenCalledTimes(1);
  //     });

  //     it('verifySubjectCredentialRequests is called', async () => {
  //       const app = {
  //         service: () => ({ get: () => dummyUser })
  //       } as unknown as Application;

  //       mockUserDataService.get.mockResolvedValueOnce(dummyUser);

  //       const service = new UserCredentialRequestsService(app);
  //       const spy = jest.spyOn(serverSdk, 'verifySubjectCredentialRequests');

//       await service.create({ ...data, user: dummyUser });
//       expect(sendPushNotification).toBeCalledWith('dummy deeplink', []);
//     });
//   });
});
