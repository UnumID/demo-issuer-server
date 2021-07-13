import { GeneralError } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { issueCredential as sdkIssueCredentialDeprecated } from '@unumid/server-sdk-deprecated-v1';
import { issueCredential as sdkIssueCredential } from '@unumid/server-sdk-deprecated-v2';
import { v4 } from 'uuid';

import logger from '../../../../src/logger';

import {
  hooks,
  buildAuthCredentialSubject,
  buildKYCCredentialSubject,
  issueCredential,
  convertUnumDtoToCredentialEntityOptions,
  getDefaultIssuerEntity,
  issueAuthCredential,
  issueKYCCredential,
  formatBearerToken
} from '../../../../src/services/api/user/user.hooks';
import {
  dummyCredentialDtoDeprecated,
  dummyCredentialDtoDeprecatedV2,
  dummyCredentialEntityOptions,
  dummyCredentialSubject,
  dummyIssuerEntity,
  dummyUser
} from '../../../mocks';

jest.spyOn(logger, 'error');

jest.mock('@unumid/server-sdk-deprecated-v1');
const mockIssueCredentialDeprecated = sdkIssueCredentialDeprecated as jest.Mock;

jest.mock('@unumid/server-sdk-deprecated-v2', () => {
  const actual = jest.requireActual('@unumid/server-sdk-deprecated-v2');
  return {
    ...actual,
    issueCredential: jest.fn() // this is the only exported function we actually want to mock
  };
});

const mockIssueCredential = sdkIssueCredential as jest.Mock;

describe('user api service hooks version 2.0.0', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('helper functions', () => {
    describe('buildAuthCredentialSubject', () => {
      it('builds the CredentialSubject for a DemoAuthCredential with the provided did and userUuid', () => {
        const did = `did:unum:${v4}`;
        const userUuid = v4();
        const userEmail = 'test@unum.id';
        const authCredential = buildAuthCredentialSubject(did, userUuid, userEmail);
        const expected = {
          id: did,
          userUuid,
          userEmail,
          isAuthorized: true
        };
        expect(authCredential).toEqual(expected);
      });
    });

    describe('buildKYCCredentialSubject', () => {
      it('builds the CredentialSubject for a KYCCredential with the provided did', () => {
        const did = `did:unum:${v4}`;
        const firstName = 'Gizmo';
        const kycCredential = buildKYCCredentialSubject(did, firstName);
        const expected = {
          id: did,
          firstName,
          lastName: 'Hendricks',
          ssn4: 4321,
          contactInformation: {
            emailAddress: 'richard@piedpiper.net',
            phoneNumber: '1073741824',
            homeAddress: {
              line1: '5320 Newell Rd',
              city: 'Palo Alto',
              state: 'CA',
              zip: 94303,
              country: 'United States'
            }
          },
          driversLicense: {
            state: 'CA',
            number: '6383736743891101',
            expiration: '2026-01-14T00:00:00.000Z'
          },
          accounts: {
            checking: {
              accountNumber: '543888430912',
              routingNumber: '021000021'
            }
          },
          confidence: '99%'
        };
        expect(kycCredential).toEqual(expected);
      });
    });

    // Note: can remove once not supporting v1.0.0 anymore. Leaving here in none-deprecated tests to show the functional differences of v1 vs v2.
    describe('issueCredential version 1.0.0', () => {
      const did = `did:unum:${v4}`;
      const userUuid = v4();
      const credentialType = 'DemoAuthCredential';
      const userEmail = 'test@unum.id';
      const credentialSubject = buildAuthCredentialSubject(did, userUuid, userEmail);
      const version = '1.0.0';

      it('issues a credential using the server sdk', async () => {
        await issueCredential(dummyIssuerEntity, credentialSubject, credentialType, version);
        expect(mockIssueCredentialDeprecated).toBeCalledWith(
          formatBearerToken(dummyIssuerEntity.authToken),
          credentialType,
          dummyIssuerEntity.issuerDid,
          credentialSubject,
          dummyIssuerEntity.privateKey
        );
      });

      it('returns the response from the sdk', async () => {
        mockIssueCredentialDeprecated.mockResolvedValueOnce(dummyCredentialDtoDeprecated);
        const received = await issueCredential(dummyIssuerEntity, credentialSubject, credentialType, version);
        expect(received).toEqual(dummyCredentialDtoDeprecated);
      });

      it('catches, logs and re-throws errors thrown by the sdk', async () => {
        const err = new Error('sdk error');
        mockIssueCredentialDeprecated.mockRejectedValueOnce(err);

        try {
          await issueCredential(dummyIssuerEntity, credentialSubject, credentialType, version);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith('issueCredential caught an error thrown by the server sdk', err);
          expect(e).toEqual(err);
        }
      });
    });

    describe('issueCredential version 2.0.0', () => {
      const did = `did:unum:${v4}`;
      const userUuid = v4();
      const credentialType = 'DemoAuthCredential';
      const userEmail = 'test@unum.id';
      const credentialSubject = buildAuthCredentialSubject(did, userUuid, userEmail);
      const version = '2.0.0';

      it('issues a credential using the server sdk', async () => {
        await issueCredential(dummyIssuerEntity, credentialSubject, credentialType, version);
        expect(mockIssueCredential).toBeCalledWith(
          formatBearerToken(dummyIssuerEntity.authToken),
          credentialType,
          dummyIssuerEntity.issuerDid,
          credentialSubject,
          dummyIssuerEntity.privateKey
        );
      });

      it('returns the response from the sdk', async () => {
        mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);
        const received = await issueCredential(dummyIssuerEntity, credentialSubject, credentialType, version);
        expect(received).toEqual(dummyCredentialDtoDeprecatedV2);
      });

      it('catches, logs and re-throws errors thrown by the sdk', async () => {
        const err = new Error('sdk error');
        mockIssueCredential.mockRejectedValueOnce(err);

        try {
          await issueCredential(dummyIssuerEntity, credentialSubject, credentialType, version);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith('issueCredential caught an error thrown by the server sdk', err);
          expect(e).toEqual(err);
        }
      });
    });

    // Note: can remove once not supporting v1.0.0 anymore. Leaving here in none-deprecated tests to show the functional differences of v1 vs v2.
    describe('convertUnumDtoToCredentialEntityOptions version 1.0.0', () => {
      const version = '1.0.0';
      it('converts an IssuerDto containing a Credential to a CredentialEntityOptions object', () => {
        const received = convertUnumDtoToCredentialEntityOptions(dummyCredentialDtoDeprecated, version);
        const expected = {
          credentialContext: dummyCredentialDtoDeprecated.body['@context'],
          credentialId: dummyCredentialDtoDeprecated.body.id,
          credentialCredentialSubject: dummyCredentialDtoDeprecated.body.credentialSubject,
          credentialCredentialStatus: dummyCredentialDtoDeprecated.body.credentialStatus,
          credentialIssuer: dummyCredentialDtoDeprecated.body.issuer,
          credentialType: dummyCredentialDtoDeprecated.body.type,
          credentialIssuanceDate: dummyCredentialDtoDeprecated.body.issuanceDate,
          credentialExpirationDate: dummyCredentialDtoDeprecated.body.expirationDate,
          credentialProof: {
            ...dummyCredentialDtoDeprecatedV2.body.proof,
            created: new Date(dummyCredentialDtoDeprecatedV2.body.proof.created)
          }
        };
        expect(received).toEqual(expected);
      });
    });

    describe('convertUnumDtoToCredentialEntityOptions version 2.0.0', () => {
      const version = '2.0.0';
      it('converts an IssuerDto containing a Credential to a CredentialEntityOptions object', () => {
        const received = convertUnumDtoToCredentialEntityOptions(dummyCredentialDtoDeprecatedV2, version);
        const expected = {
          credentialContext: dummyCredentialDtoDeprecatedV2.body['@context'],
          credentialId: dummyCredentialDtoDeprecatedV2.body.id,
          credentialCredentialSubject: dummyCredentialSubject,
          credentialCredentialStatus: dummyCredentialDtoDeprecatedV2.body.credentialStatus,
          credentialIssuer: dummyCredentialDtoDeprecatedV2.body.issuer,
          credentialType: dummyCredentialDtoDeprecatedV2.body.type,
          credentialIssuanceDate: dummyCredentialDtoDeprecatedV2.body.issuanceDate,
          credentialExpirationDate: dummyCredentialDtoDeprecatedV2.body.expirationDate,
          credentialProof: {
            ...dummyCredentialDtoDeprecatedV2.body.proof,
            created: new Date(dummyCredentialDtoDeprecatedV2.body.proof.created)
          }
        };
        expect(received).toEqual(expected);
      });
    });

    describe('formatBearerToken', () => {
      it('returns the token formatted as a Bearer token', () => {
        const bearerToken = formatBearerToken(dummyIssuerEntity.authToken);
        expect(bearerToken).toEqual(`Bearer ${dummyIssuerEntity.authToken}`);
      });

      it('returns a correctly formatted token without changing it', () => {
        const bearerToken = `Bearer ${dummyIssuerEntity.authToken}`;
        expect(formatBearerToken(bearerToken)).toBe(bearerToken);
      });
    });
  });
  describe('after patch', () => {
    describe('getDefaultIssuerEntity', () => {
      const mockGetDefaultIssuerEntity = jest.fn();
      const ctx = {
        app: {
          service: jest.fn(() => ({
            getDefaultIssuerEntity: mockGetDefaultIssuerEntity
          }))
        }
      } as unknown as HookContext;
      it('runs as the first after patch hook', () => {
        expect(hooks.after.patch[0]).toBe(getDefaultIssuerEntity);
      });

      it('gets the default IssuerEntity from the issuer data service', async () => {
        await getDefaultIssuerEntity(ctx);
        expect(ctx.app.service).toBeCalledWith('issuerData');
        expect(mockGetDefaultIssuerEntity).toBeCalled();
      });

      it('returns a new context with the default IssuerEntity in params', async () => {
        mockGetDefaultIssuerEntity.mockResolvedValueOnce(dummyIssuerEntity);
        const newCtx = await getDefaultIssuerEntity(ctx) as HookContext;
        expect(newCtx.params.defaultIssuerEntity).toEqual(dummyIssuerEntity);
      });

      it('catches, logs and re-throws errors thrown getting the default IssuerEntity', async () => {
        const err = new Error('IssuerDataService error');
        mockGetDefaultIssuerEntity.mockRejectedValueOnce(err);
        try {
          await getDefaultIssuerEntity(ctx);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith(
            'getDefaultIssuerEntity hook caught an error thrown by issuerDataService.getDefaultIssuerEntity',
            err
          );
          expect(e).toEqual(err);
        }
      });
    });

    describe('issueAuthCredential', () => {
      it('runs as the second after patch hook', () => {
        expect(hooks.after.patch[1]).toBe(issueAuthCredential);
      });

      it('throws if the defaultIssuerEntity param has not been set', async () => {
        const did = `did:unum:${v4()}`;
        const ctx = {
          data: { did },
          result: dummyUser,
          id: dummyUser.uuid,
          params: { headers: { version: '2.0.0' } }
        } as unknown as HookContext;

        try {
          await issueAuthCredential(ctx);
          fail();
        } catch (e) {
          console.log(e);
          expect(e).toBeInstanceOf(GeneralError);
        }
      });

      it('exits early if the did is not being updated', async () => {
        const ctx = {
          data: { email: 'test@unumid.org' },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } }
        } as unknown as HookContext;

        await issueAuthCredential(ctx);
        expect(mockIssueCredential).not.toBeCalled();
      });

      // it('issues a DemoAuthCredential', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);
      //   const did = `did:unum:${v4()}`;
      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueAuthCredential(ctx);

      //   expect(mockIssueCredential).toBeCalled();
      //   expect(mockIssueCredential).toBeCalledWith(
      //     formatBearerToken(dummyIssuerEntity.authToken),
      //     'DemoAuthCredential',
      //     dummyIssuerEntity.issuerDid,
      //     buildAuthCredentialSubject(ctx.data.did, ctx.id as string, dummyUser.email),
      //     dummyIssuerEntity.privateKey
      //   );
      // });

      // it('stores the issued credential', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);
      //   const did = `did:unum:${v4()}`;
      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueAuthCredential(ctx);
      //   const expected = {
      //     ...dummyCredentialEntityOptions,
      //     credentialProof: {
      //       ...dummyCredentialEntityOptions.credentialProof,
      //       created: new Date(dummyCredentialEntityOptions.credentialProof.created)
      //     }
      //   };

      //   expect(mockCredentialDataService.create).toBeCalledWith(expected);
      // });

      // it('catches, logs and re-throws errors storing the credential', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);

      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   const err = new Error('CredentialDataService error');
      //   mockCredentialDataService.create.mockRejectedValueOnce(err);
      //   try {
      //     await issueAuthCredential(ctx);
      //     fail();
      //   } catch (e) {
      //     expect(logger.error).toBeCalledWith(
      //       'issueAuthCredential hook caught an error thrown by credentialDataService.create',
      //       err
      //     );
      //     expect(e).toEqual(err);
      //   }
      // });

      // it('updates the issuer authToken if it has been reissued', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce({
      //     ...dummyCredentialDtoDeprecatedV2,
      //     authToken: 'updated auth token'
      //   });

      //   const userUuid = v4();
      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: userUuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueAuthCredential(ctx);

      //   expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, { authToken: 'updated auth token' });
      // });

      // it('catches, logs and re-throws errors updating the issuer authToken', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce({
      //     ...dummyCredentialDtoDeprecatedV2,
      //     authToken: 'updated auth token'
      //   });

      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   const err = new Error('IssuerDataService error');
      //   mockIssuerDataService.patch.mockRejectedValueOnce(err);

      //   try {
      //     await issueAuthCredential(ctx);
      //   } catch (e) {
      //     expect(logger.error).toBeCalledWith(
      //       'issueAuthCredential hook caught an error thrown by issuerDataService.patch',
      //       err
      //     );
      //     expect(e).toEqual(err);
      //   }
      // });
    });

    describe('issueKYCCredential', () => {
      it('runs as the third after patch hook', () => {
        expect(hooks.after.patch[2]).toBe(issueKYCCredential);
      });

      it('throws if the defaultIssuerEntity param has not been set', async () => {
        const did = `did:unum:${v4()}`;

        const ctx = {
          data: { did },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { headers: { version: '2.0.0' } }
        } as unknown as HookContext;

        try {
          await issueKYCCredential(ctx);
          fail();
        } catch (e) {
          console.log(e);
          expect(e).toBeInstanceOf(GeneralError);
        }
      });

      it('exits early if the did is not being updated', async () => {
        const email = 'test@unum.id';

        const ctx = {
          data: { email },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } }
        } as unknown as HookContext;

        await issueKYCCredential(ctx);
        expect(mockIssueCredential).not.toBeCalled();
      });

      // it('issues a KYCCredential', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);
      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     result: dummyUser,
      //     id: dummyUser.uuid,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueKYCCredential(ctx);

      //   expect(mockIssueCredential).toBeCalled();
      //   expect(mockIssueCredential).toBeCalledWith(
      //     formatBearerToken(dummyIssuerEntity.authToken),
      //     'KYCCredential',
      //     dummyIssuerEntity.issuerDid,
      //     buildKYCCredentialSubject(ctx.data.did, dummyUser.firstName),
      //     dummyIssuerEntity.privateKey
      //   );
      // });

      // it('stores the issued credential', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);
      //   const did = `did:unum:${v4()}`;
      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueKYCCredential(ctx);

      //   const expected = {
      //     ...dummyCredentialEntityOptions,
      //     credentialProof: {
      //       ...dummyCredentialEntityOptions.credentialProof,
      //       created: new Date(dummyCredentialEntityOptions.credentialProof.created)
      //     }
      //   };

      //   expect(mockCredentialDataService.create).toBeCalledWith(expected);
      // });

      // it('catches, logs and re-throws errors storing the credential', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce(dummyCredentialDtoDeprecatedV2);
      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   const err = new Error('CredentialDataService error');
      //   mockCredentialDataService.create.mockRejectedValueOnce(err);
      //   try {
      //     await issueKYCCredential(ctx);
      //     fail();
      //   } catch (e) {
      //     expect(logger.error).toBeCalledWith(
      //       'issueKYCCredential hook caught an error thrown by credentialDataService.create',
      //       err
      //     );
      //     expect(e).toEqual(err);
      //   }
      // });

      // it('updates the issuer authToken if it has been reissued', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce({
      //     ...dummyCredentialDtoDeprecatedV2,
      //     authToken: 'updated auth token'
      //   });

      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueKYCCredential(ctx);

      //   expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, { authToken: 'updated auth token' });
      // });

      // it('catches, logs, and re-throws errors updating the issuer authToken', async () => {
      //   const mockService = jest.fn();
      //   const mockCredentialDataService = {
      //     create: jest.fn()
      //   };
      //   const mockIssuerDataService = {
      //     patch: jest.fn()
      //   };

      //   mockService
      //     .mockReturnValueOnce(mockCredentialDataService)
      //     .mockReturnValueOnce(mockIssuerDataService);

      //   mockIssueCredential.mockResolvedValueOnce({
      //     ...dummyCredentialDtoDeprecatedV2,
      //     authToken: 'updated auth token'
      //   });

      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '2.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   const err = new Error('IssuerDataService error');
      //   mockIssuerDataService.patch.mockRejectedValueOnce(err);

      //   try {
      //     await issueKYCCredential(ctx);
      //   } catch (e) {
      //     expect(logger.error).toBeCalledWith(
      //       'issueKYCCredential hook caught an error thrown by issuerDataService.patch',
      //       err
      //     );
      //     expect(e).toEqual(err);
      //   }
      // });
    });
  });
});
