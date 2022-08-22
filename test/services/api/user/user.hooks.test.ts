import { GeneralError } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { issueCredential as sdkIssueCredential, issueCredentials, issueCredentials as sdkIssueCredentials } from '@unumid/server-sdk';
import { v4 } from 'uuid';

import logger from '../../../../src/logger';

import {
  hooks,
  convertUnumDtoToCredentialEntityOptions,
  getDefaultIssuerEntity,
  issueAuthAndKYCAndEmailCredentials
} from '../../../../src/services/api/user/user.hooks';
import { convertCredentialToCredentialEntityOptions } from '../../../../src/utils/converters';
import { buildAuthCredentialSubject, buildEmailCredentialSubject, buildKYCCredentialSubject, issueCredentialsHelper } from '../../../../src/utils/credentials';
import { formatBearerToken } from '../../../../src/utils/formatBearerToken';
import {
  dummyCredentialDto,
  dummyCredentialEntityOptions,
  dummyCredentialsDto,
  dummyCredentialSubject,
  dummyIssuerEntity,
  dummyUser
} from '../../../mocks';

jest.spyOn(logger, 'error');

jest.mock('@unumid/server-sdk', () => {
  const actual = jest.requireActual('@unumid/server-sdk');
  return {
    ...actual,
    issueCredential: jest.fn(), // this is the only exported function we actually want to mock
    issueCredentials: jest.fn() // this is the only exported function we actually want to mock
  };
});

const mockIssueCredential = sdkIssueCredential as jest.Mock;
const mockIssueCredentials = sdkIssueCredentials as jest.Mock;

describe('user api service hooks version 3.0.0', () => {
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
          type: 'DemoAuthCredential',
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
          type: 'KYCCredential',
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

    describe('buildEmailCredentialSubject', () => {
      it('builds the CredentialSubject for a EmailCredential with the provided did and email', () => {
        const did = `did:unum:${v4}`;
        const email = 'test@unum.id';
        const emailCredential = buildEmailCredentialSubject(did, email);
        const expected = {
          type: 'EmailCredential',
          id: did,
          email
        };
        expect(emailCredential).toEqual(expected);
      });
    });

    describe('issueCredentials', () => {
      const did = `did:unum:${v4}`;
      const userUuid = v4();
      const credentialTypes = ['DemoAuthCredential', 'EmailCredential', 'KYCCredential'];
      const userEmail = 'test@unum.id';
      const credentialSubject1 = {
        ...buildAuthCredentialSubject(did, userUuid, userEmail),
        type: 'DemoAuthCredential'
      };
      const credentialSubject2 = {
        ...buildKYCCredentialSubject(did, userUuid),
        type: 'KYCCredential'
      };
      const credentialSubject3 = buildEmailCredentialSubject(did, userEmail);

      const credentialSubjects = [credentialSubject1, credentialSubject2, credentialSubject3];

      it('issues a credentials using the server sdk', async () => {
        await issueCredentialsHelper(dummyIssuerEntity, did, credentialSubjects);
        expect(mockIssueCredentials).toBeCalledWith(
          formatBearerToken(dummyIssuerEntity.authToken),
          dummyIssuerEntity.issuerDid,
          did,
          credentialSubjects,
          dummyIssuerEntity.privateKey
        );
      });

      it('returns the credentials response from the sdk', async () => {
        mockIssueCredentials.mockResolvedValueOnce(dummyCredentialsDto);
        const received = await issueCredentialsHelper(dummyIssuerEntity, did, credentialSubjects);
        expect(received).toEqual(dummyCredentialsDto);
      });

      it('catches, logs and re-throws errors thrown by the sdk', async () => {
        const err = new Error('sdk error');
        mockIssueCredentials.mockRejectedValueOnce(err);

        try {
          await issueCredentialsHelper(dummyIssuerEntity, did, credentialSubjects);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith(`issueCredentials caught an error thrown by the server sdk. ${e}`);
          expect(e).toEqual(err);
        }
      });
    });

    describe('convertUnumDtoToCredentialEntityOptions version 3.0.0', () => {
      it('converts an UnumDto containing a Credential to a CredentialEntityOptions object', () => {
        const received = convertUnumDtoToCredentialEntityOptions(dummyCredentialDto);
        const expected = {
          credentialContext: dummyCredentialDto.body.context,
          credentialId: dummyCredentialDto.body.id,
          credentialCredentialSubject: dummyCredentialSubject,
          credentialCredentialStatus: dummyCredentialDto.body.credentialStatus,
          credentialIssuer: dummyCredentialDto.body.issuer,
          credentialType: dummyCredentialDto.body.type,
          credentialIssuanceDate: dummyCredentialDto.body.issuanceDate,
          credentialExpirationDate: dummyCredentialDto.body.expirationDate,
          credentialProof: dummyCredentialDto.body.proof
        };
        expect(received).toEqual(expected);
      });
    });

    describe('convertCredentialToCredentialEntityOptions version 3.0.0', () => {
      it('converts a Credential to a CredentialEntityOptions object', () => {
        const received = convertCredentialToCredentialEntityOptions(dummyCredentialDto.body);
        const expected = {
          credentialContext: dummyCredentialDto.body.context,
          credentialId: dummyCredentialDto.body.id,
          credentialCredentialSubject: dummyCredentialSubject,
          credentialCredentialStatus: dummyCredentialDto.body.credentialStatus,
          credentialIssuer: dummyCredentialDto.body.issuer,
          credentialType: dummyCredentialDto.body.type,
          credentialIssuanceDate: dummyCredentialDto.body.issuanceDate,
          credentialExpirationDate: dummyCredentialDto.body.expirationDate,
          credentialProof: dummyCredentialDto.body.proof
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

    describe('issueAuthAndKYCCredential', () => {
      it('runs as the second after patch hook', () => {
        expect(hooks.after.patch[1]).toBe(issueAuthAndKYCAndEmailCredentials);
      });

      it('throws if the defaultIssuerEntity param has not been set', async () => {
        const did = `did:unum:${v4()}`;
        const ctx = {
          data: { did },
          result: dummyUser,
          id: dummyUser.uuid,
          params: { headers: { version: '3.0.0' } }
        } as unknown as HookContext;

        try {
          await issueAuthAndKYCAndEmailCredentials(ctx);
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
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } }
        } as unknown as HookContext;

        await issueAuthAndKYCAndEmailCredentials(ctx);
        expect(mockIssueCredentials).not.toBeCalled();
      });

      // TODO make these three commented out test pass...
      // it('issues a DemoAuthCredential and KYCCredential', async () => {
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

      //   mockIssueCredentials.mockResolvedValueOnce(dummyCredentialsDto);
      //   const did = `did:unum:${v4()}`;
      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueAuthAndKYCAndEmailCredentials(ctx);

      //   const credentialTypes = ['DemoAuthCredential', 'KYCCredential'];
      //   const userUuid = v4();
      //   const userEmail = 'test@unum.id';
      //   const credentialSubject1 = buildAuthCredentialSubject(did, userUuid, userEmail);
      //   const credentialSubject2 = buildKYCCredentialSubject(did, userUuid);
      //   const credentialDataList = [credentialSubject1, credentialSubject2];

      //   expect(mockIssueCredentials).toBeCalled();
      //   expect(mockIssueCredentials).toBeCalledWith(
      //     formatBearerToken(dummyIssuerEntity.authToken),
      //     ['DemoAuthCredential', 'KYCCredential'],
      //     dummyIssuerEntity.issuerDid,
      //     did,
      //     credentialDataList,
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

      //   mockIssueCredentials.mockResolvedValueOnce(dummyCredentialsDto);
      //   const did = `did:unum:${v4()}`;
      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueAuthAndKYCAndEmailCredentials(ctx);
      //   expect(mockCredentialDataService.create).toBeCalledWith(dummyCredentialEntityOptions);
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

      //   mockIssueCredentials.mockResolvedValueOnce(dummyCredentialsDto);

      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   const err = new Error('CredentialDataService error');
      //   mockCredentialDataService.create.mockRejectedValue(err);
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

      //   mockIssueCredentials.mockResolvedValueOnce({
      //     ...dummyCredentialsDto,
      //     authToken: 'updated auth token'
      //   });

      //   const userUuid = v4();
      //   const did = `did:unum:${v4()}`;

      //   const ctx = {
      //     data: { did },
      //     id: dummyUser.uuid,
      //     result: dummyUser,
      //     params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
      //     app: {
      //       service: mockService
      //     }
      //   } as unknown as HookContext;

      //   await issueAuthAndKYCAndEmailCredentials(ctx);

      //   expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, { authToken: 'updated auth token' });
      // });

      it('catches, logs and re-throws errors updating the issuer authToken', async () => {
        const mockService = jest.fn();
        const mockCredentialDataService = {
          create: jest.fn()
        };
        const mockIssuerDataService = {
          patch: jest.fn()
        };

        mockService
          .mockReturnValueOnce(mockCredentialDataService)
          .mockReturnValueOnce(mockIssuerDataService);

        mockIssueCredentials.mockResolvedValueOnce({
          ...dummyCredentialsDto,
          authToken: 'updated auth token'
        });

        const did = `did:unum:${v4()}`;

        const ctx = {
          data: { did },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        const err = new Error('IssuerDataService error');
        mockIssuerDataService.patch.mockRejectedValueOnce(err);

        try {
          await issueAuthAndKYCAndEmailCredentials(ctx);
        } catch (e) {
          expect(logger.error).toBeCalledWith(
            'issueAuthAndKYCAndEmailCredentials hook caught an error thrown by issuerDataService.patch',
            err
          );
          expect(e).toEqual(err);
        }
      });
    });

    describe('issueAuthCredential', () => {
      // it('runs as the second after patch hook', () => {
      //   // expect(hooks.after.patch[1]).toBe(issueAuthAndKYCAndEmailCredentials);
      //   expect(hooks.after.patch[1]).toBe(issueAuthCredential);
      // });

      it('throws if the defaultIssuerEntity param has not been set', async () => {
        const did = `did:unum:${v4()}`;
        const ctx = {
          data: { did },
          result: dummyUser,
          id: dummyUser.uuid,
          params: { headers: { version: '3.0.0' } }
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
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } }
        } as unknown as HookContext;

        await issueAuthCredential(ctx);
        expect(mockIssueCredential).not.toBeCalled();
      });

      it('issues a DemoAuthCredential', async () => {
        const mockService = jest.fn();
        const mockCredentialDataService = {
          create: jest.fn()
        };
        const mockIssuerDataService = {
          patch: jest.fn()
        };

        mockService
          .mockReturnValueOnce(mockCredentialDataService)
          .mockReturnValueOnce(mockIssuerDataService);

        mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);
        const did = `did:unum:${v4()}`;
        const ctx = {
          data: { did },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueAuthCredential(ctx);

        expect(mockIssueCredential).toBeCalled();
        expect(mockIssueCredential).toBeCalledWith(
          formatBearerToken(dummyIssuerEntity.authToken),
          'DemoAuthCredential',
          dummyIssuerEntity.issuerDid,
          buildAuthCredentialSubject(ctx.data.did, ctx.id as string, dummyUser.email),
          dummyIssuerEntity.privateKey
        );
      });

      it('stores the issued credential', async () => {
        const mockService = jest.fn();
        const mockCredentialDataService = {
          create: jest.fn()
        };
        const mockIssuerDataService = {
          patch: jest.fn()
        };

        mockService
          .mockReturnValueOnce(mockCredentialDataService)
          .mockReturnValueOnce(mockIssuerDataService);

        mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);
        const did = `did:unum:${v4()}`;
        const ctx = {
          data: { did },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueAuthCredential(ctx);
        expect(mockCredentialDataService.create).toBeCalledWith(dummyCredentialEntityOptions);
      });

      it('catches, logs and re-throws errors storing the credential', async () => {
        const mockService = jest.fn();
        const mockCredentialDataService = {
          create: jest.fn()
        };
        const mockIssuerDataService = {
          patch: jest.fn()
        };

        mockService
          .mockReturnValueOnce(mockCredentialDataService)
          .mockReturnValueOnce(mockIssuerDataService);

        mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);

        const did = `did:unum:${v4()}`;

        const ctx = {
          data: { did },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        const err = new Error('CredentialDataService error');
        mockCredentialDataService.create.mockRejectedValueOnce(err);
        try {
          await issueAuthCredential(ctx);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith(
            'issueAuthCredential hook caught an error thrown by credentialDataService.create',
            err
          );
          expect(e).toEqual(err);
        }
      });

      it('updates the issuer authToken if it has been reissued', async () => {
        const mockService = jest.fn();
        const mockCredentialDataService = {
          create: jest.fn()
        };
        const mockIssuerDataService = {
          patch: jest.fn()
        };

        mockService
          .mockReturnValueOnce(mockCredentialDataService)
          .mockReturnValueOnce(mockIssuerDataService);

        mockIssueCredential.mockResolvedValueOnce({
          ...dummyCredentialDto,
          authToken: 'updated auth token'
        });

        const userUuid = v4();
        const did = `did:unum:${v4()}`;

        const ctx = {
          data: { did },
          id: userUuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueAuthCredential(ctx);

        expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, { authToken: 'updated auth token' });
      });

      it('catches, logs and re-throws errors updating the issuer authToken', async () => {
        const mockService = jest.fn();
        const mockCredentialDataService = {
          create: jest.fn()
        };
        const mockIssuerDataService = {
          patch: jest.fn()
        };

        mockService
          .mockReturnValueOnce(mockCredentialDataService)
          .mockReturnValueOnce(mockIssuerDataService);

        mockIssueCredential.mockResolvedValueOnce({
          ...dummyCredentialDto,
          authToken: 'updated auth token'
        });

        const did = `did:unum:${v4()}`;

        const ctx = {
          data: { did },
          id: dummyUser.uuid,
          result: dummyUser,
          params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        const err = new Error('IssuerDataService error');
        mockIssuerDataService.patch.mockRejectedValueOnce(err);

        try {
          await issueAuthCredential(ctx);
        } catch (e) {
          expect(logger.error).toBeCalledWith(
            'issueAuthCredential hook caught an error thrown by issuerDataService.patch',
            err
          );
          expect(e).toEqual(err);
        }
      });
    });

    // describe('issueKYCCredential', () => {
    //   // it('runs as the third after patch hook', () => {
    //   //   // expect(hooks.after.patch[1]).toBe(issueAuthAndKYCAndEmailCredentials);
    //   //   expect(hooks.after.patch[2]).toBe(issueKYCCredential);
    //   // });

    //   it('throws if the defaultIssuerEntity param has not been set', async () => {
    //     const did = `did:unum:${v4()}`;

    //     const ctx = {
    //       data: { did },
    //       id: dummyUser.uuid,
    //       result: dummyUser,
    //       params: { headers: { version: '3.0.0' } }
    //     } as unknown as HookContext;

    //     try {
    //       await issueKYCCredential(ctx);
    //       fail();
    //     } catch (e) {
    //       console.log(e);
    //       expect(e).toBeInstanceOf(GeneralError);
    //     }
    //   });

    //   it('exits early if the did is not being updated', async () => {
    //     const email = 'test@unum.id';

    //     const ctx = {
    //       data: { email },
    //       id: dummyUser.uuid,
    //       result: dummyUser,
    //       params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } }
    //     } as unknown as HookContext;

    //     await issueKYCCredential(ctx);
    //     expect(mockIssueCredential).not.toBeCalled();
    //   });

    //   it('issues a KYCCredential', async () => {
    //     const mockService = jest.fn();
    //     const mockCredentialDataService = {
    //       create: jest.fn()
    //     };
    //     const mockIssuerDataService = {
    //       patch: jest.fn()
    //     };

    //     mockService
    //       .mockReturnValueOnce(mockCredentialDataService)
    //       .mockReturnValueOnce(mockIssuerDataService);

    //     mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);
    //     const did = `did:unum:${v4()}`;

    //     const ctx = {
    //       data: { did },
    //       result: dummyUser,
    //       id: dummyUser.uuid,
    //       params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
    //       app: {
    //         service: mockService
    //       }
    //     } as unknown as HookContext;

    //     await issueKYCCredential(ctx);

    //     expect(mockIssueCredential).toBeCalled();
    //     expect(mockIssueCredential).toBeCalledWith(
    //       formatBearerToken(dummyIssuerEntity.authToken),
    //       'KYCCredential',
    //       dummyIssuerEntity.issuerDid,
    //       buildKYCCredentialSubject(ctx.data.did, dummyUser.firstName),
    //       dummyIssuerEntity.privateKey
    //     );
    //   });

    //   it('stores the issued credential', async () => {
    //     const mockService = jest.fn();
    //     const mockCredentialDataService = {
    //       create: jest.fn()
    //     };
    //     const mockIssuerDataService = {
    //       patch: jest.fn()
    //     };

    //     mockService
    //       .mockReturnValueOnce(mockCredentialDataService)
    //       .mockReturnValueOnce(mockIssuerDataService);

    //     mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);
    //     const did = `did:unum:${v4()}`;
    //     const ctx = {
    //       data: { did },
    //       id: dummyUser.uuid,
    //       result: dummyUser,
    //       params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
    //       app: {
    //         service: mockService
    //       }
    //     } as unknown as HookContext;

    //     await issueKYCCredential(ctx);
    //     expect(mockCredentialDataService.create).toBeCalledWith(dummyCredentialEntityOptions);
    //   });

    //   it('catches, logs and re-throws errors storing the credential', async () => {
    //     const mockService = jest.fn();
    //     const mockCredentialDataService = {
    //       create: jest.fn()
    //     };
    //     const mockIssuerDataService = {
    //       patch: jest.fn()
    //     };

    //     mockService
    //       .mockReturnValueOnce(mockCredentialDataService)
    //       .mockReturnValueOnce(mockIssuerDataService);

    //     mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);
    //     const did = `did:unum:${v4()}`;

    //     const ctx = {
    //       data: { did },
    //       id: dummyUser.uuid,
    //       result: dummyUser,
    //       params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
    //       app: {
    //         service: mockService
    //       }
    //     } as unknown as HookContext;

    //     const err = new Error('CredentialDataService error');
    //     mockCredentialDataService.create.mockRejectedValueOnce(err);
    //     try {
    //       await issueKYCCredential(ctx);
    //       fail();
    //     } catch (e) {
    //       expect(logger.error).toBeCalledWith(
    //         'issueKYCCredential hook caught an error thrown by credentialDataService.create',
    //         err
    //       );
    //       expect(e).toEqual(err);
    //     }
    //   });

    //   it('updates the issuer authToken if it has been reissued', async () => {
    //     const mockService = jest.fn();
    //     const mockCredentialDataService = {
    //       create: jest.fn()
    //     };
    //     const mockIssuerDataService = {
    //       patch: jest.fn()
    //     };

    //     mockService
    //       .mockReturnValueOnce(mockCredentialDataService)
    //       .mockReturnValueOnce(mockIssuerDataService);

    //     mockIssueCredential.mockResolvedValueOnce({
    //       ...dummyCredentialDto,
    //       authToken: 'updated auth token'
    //     });

    //     const did = `did:unum:${v4()}`;

    //     const ctx = {
    //       data: { did },
    //       id: dummyUser.uuid,
    //       result: dummyUser,
    //       params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
    //       app: {
    //         service: mockService
    //       }
    //     } as unknown as HookContext;

    //     await issueKYCCredential(ctx);

    //     expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, { authToken: 'updated auth token' });
    //   });

    //   it('catches, logs, and re-throws errors updating the issuer authToken', async () => {
    //     const mockService = jest.fn();
    //     const mockCredentialDataService = {
    //       create: jest.fn()
    //     };
    //     const mockIssuerDataService = {
    //       patch: jest.fn()
    //     };

    //     mockService
    //       .mockReturnValueOnce(mockCredentialDataService)
    //       .mockReturnValueOnce(mockIssuerDataService);

    //     mockIssueCredential.mockResolvedValueOnce({
    //       ...dummyCredentialDto,
    //       authToken: 'updated auth token'
    //     });

    //     const did = `did:unum:${v4()}`;

    //     const ctx = {
    //       data: { did },
    //       id: dummyUser.uuid,
    //       result: dummyUser,
    //       params: { defaultIssuerEntity: dummyIssuerEntity, headers: { version: '3.0.0' } },
    //       app: {
    //         service: mockService
    //       }
    //     } as unknown as HookContext;

    //     const err = new Error('IssuerDataService error');
    //     mockIssuerDataService.patch.mockRejectedValueOnce(err);

    //     try {
    //       await issueKYCCredential(ctx);
    //     } catch (e) {
    //       expect(logger.error).toBeCalledWith(
    //         'issueKYCCredential hook caught an error thrown by issuerDataService.patch',
    //         err
    //       );
    //       expect(e).toEqual(err);
    //     }
    //   });
    // });
  });
});
