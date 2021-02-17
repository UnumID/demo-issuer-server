import { GeneralError } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { issueCredential as sdkIssueCredential } from '@unumid/server-sdk';
import { v4 } from 'uuid';

import logger from '../../../../src/logger';

import {
  hooks,
  buildAuthCredentialSubject,
  buildKYCCredentialSubject,
  issueCredential,
  convertIssuerDtoToCredentialEntityOptions,
  getDefaultIssuerEntity,
  issueAuthCredential,
  issueKYCCredential
} from '../../../../src/services/api/user/user.hooks';
import { dummyCredentialDto, dummyCredentialEntityOptions, dummyIssuerEntity } from '../../../mocks';

jest.mock('@unumid/server-sdk');
jest.spyOn(logger, 'error');
const mockIssueCredential = sdkIssueCredential as jest.Mock;

describe('user api service hooks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('helper functions', () => {
    describe('buildAuthCredentialSubject', () => {
      it('builds the CredentialSubject for a DemoAuthCredential with the provided did and userUuid', () => {
        const did = `did:unum:${v4}`;
        const userUuid = v4();
        const authCredential = buildAuthCredentialSubject(did, userUuid);
        const expected = {
          id: did,
          userUuid,
          isAuthorized: true
        };
        expect(authCredential).toEqual(expected);
      });
    });

    describe('buildKYCCredentialSubject', () => {
      it('builds the CredentialSubject for a KYCCredential with the provided did', () => {
        const did = `did:unum:${v4}`;
        const kycCredential = buildKYCCredentialSubject(did);
        const expected = {
          id: did,
          firstName: 'Richard',
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

    describe('issueCredential', () => {
      const did = `did:unum:${v4}`;
      const userUuid = v4();
      const credentialType = 'DemoAuthCredential';
      const credentialSubject = buildAuthCredentialSubject(did, userUuid);

      it('issues a credential using the server sdk', async () => {
        await issueCredential(dummyIssuerEntity, credentialSubject, credentialType);
        expect(mockIssueCredential).toBeCalledWith(
          dummyIssuerEntity.authToken,
          credentialType,
          dummyIssuerEntity.issuerDid,
          credentialSubject,
          dummyIssuerEntity.privateKey
        );
      });

      it('returns the response from the sdk', async () => {
        mockIssueCredential.mockResolvedValueOnce(dummyCredentialDto);
        const received = await issueCredential(dummyIssuerEntity, credentialSubject, credentialType);
        expect(received).toEqual(dummyCredentialDto);
      });

      it('catches, logs and re-throws errors thrown by the sdk', async () => {
        const err = new Error('sdk error');
        mockIssueCredential.mockRejectedValueOnce(err);

        try {
          await issueCredential(dummyIssuerEntity, credentialSubject, credentialType);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith('issueCredential caught an error thrown by the server sdk', err);
          expect(e).toEqual(err);
        }
      });
    });

    describe('convertIssuerDtoToCredentialEntityOptions', () => {
      it('converts an IssuerDto containing a Credential to a CredentialEntityOptions object', () => {
        const received = convertIssuerDtoToCredentialEntityOptions(dummyCredentialDto);
        const expected = {
          credentialContext: dummyCredentialDto.body['@context'],
          credentialId: dummyCredentialDto.body.id,
          credentialCredentialSubject: dummyCredentialDto.body.credentialSubject,
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: {}
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
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity }
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueAuthCredential(ctx);

        expect(mockIssueCredential).toBeCalled();
        expect(mockIssueCredential).toBeCalledWith(
          dummyIssuerEntity.authToken,
          'DemoAuthCredential',
          dummyIssuerEntity.issuerDid,
          buildAuthCredentialSubject(ctx.data.did, ctx.id as string),
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
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

    describe('issueKYCCredential', () => {
      it('runs as the third after patch hook', () => {
        expect(hooks.after.patch[2]).toBe(issueKYCCredential);
      });

      it('throws if the defaultIssuerEntity param has not been set', async () => {
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: {}
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
        const ctx = {
          data: { email: 'test@unumid.org' },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity }
        } as unknown as HookContext;

        await issueKYCCredential(ctx);
        expect(mockIssueCredential).not.toBeCalled();
      });

      it('issues a KYCCredential', async () => {
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueKYCCredential(ctx);

        expect(mockIssueCredential).toBeCalled();
        expect(mockIssueCredential).toBeCalledWith(
          dummyIssuerEntity.authToken,
          'KYCCredential',
          dummyIssuerEntity.issuerDid,
          buildKYCCredentialSubject(ctx.data.did),
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueKYCCredential(ctx);
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        const err = new Error('CredentialDataService error');
        mockCredentialDataService.create.mockRejectedValueOnce(err);
        try {
          await issueKYCCredential(ctx);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith(
            'issueKYCCredential hook caught an error thrown by credentialDataService.create',
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        await issueKYCCredential(ctx);

        expect(mockIssuerDataService.patch).toBeCalledWith(dummyIssuerEntity.uuid, { authToken: 'updated auth token' });
      });

      it('catches, logs, and re-throws errors updating the issuer authToken', async () => {
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
        const ctx = {
          data: { did: `did:unum:${v4()}` },
          id: v4(),
          params: { defaultIssuerEntity: dummyIssuerEntity },
          app: {
            service: mockService
          }
        } as unknown as HookContext;

        const err = new Error('IssuerDataService error');
        mockIssuerDataService.patch.mockRejectedValueOnce(err);

        try {
          await issueKYCCredential(ctx);
        } catch (e) {
          expect(logger.error).toBeCalledWith(
            'issueKYCCredential hook caught an error thrown by issuerDataService.patch',
            err
          );
          expect(e).toEqual(err);
        }
      });
    });
  });
});
