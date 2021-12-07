import { BadRequest } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { registerIssuer } from '@unumid/server-sdk';

import { hooks, validateIssuerCreateOptions, registerIssuerHook } from '../../../../src/services/api/issuer/issuer.hooks';
import { IssuerEntityOptions } from '../../../../src/entities/Issuer';
import { dummyIssuerEntityOptions, dummyIssuer } from '../../../mocks';
import logger from '../../../../src/logger';

jest.mock('@unumid/server-sdk');
jest.spyOn(logger, 'error');
const mockRegisterIssuer = registerIssuer as jest.Mock;

const dummyIssuerDto = {
  authToken: dummyIssuerEntityOptions.authToken,
  body: {
    ...dummyIssuer,
    createdAt: new Date(dummyIssuer.createdAt),
    updatedAt: new Date(dummyIssuer.updatedAt),
    keys: {
      signing: {
        privateKey: dummyIssuerEntityOptions.privateKey
      }
    }
  }
};

describe('issuer api service hooks', () => {
  describe('before create', () => {
    describe('validateIssuerCreateOptions', () => {
      it('runs as the first before create hook', () => {
        expect(hooks.before.create[0]).toBe(validateIssuerCreateOptions);
      });

      it('throws a BadRequest if data is missing', () => {
        const ctx = {} as HookContext<IssuerEntityOptions>;
        try {
          validateIssuerCreateOptions(ctx);
          fail();
        } catch (e) {
          expect(e).toEqual(new BadRequest('data is required.'));
        }
      });
      it('throws a BadRequest if issuerName is missing', () => {
        const ctx = {
          data: {
            apiKey: dummyIssuerEntityOptions.apiKey,
            issuerCustomerUuid: dummyIssuerEntityOptions.issuerCustomerUuid
          }
        } as HookContext<IssuerEntityOptions>;
        try {
          validateIssuerCreateOptions(ctx);
          fail();
        } catch (e) {
          expect(e).toEqual(new BadRequest('issuerName is required.'));
        }
      });

      it('throws a BadRequest if apiKey is missing', () => {
        const ctx = {
          data: {
            issuerName: dummyIssuerEntityOptions.issuerName,
            issuerCustomerUuid: dummyIssuerEntityOptions.issuerCustomerUuid
          }
        } as HookContext<IssuerEntityOptions>;
        try {
          validateIssuerCreateOptions(ctx);
          fail();
        } catch (e) {
          expect(e).toEqual(new BadRequest('apiKey is required.'));
        }
      });

      it('throws a BadRequest if issuerCustomerUuid is missing', () => {
        const ctx = {
          data: {
            apiKey: dummyIssuerEntityOptions.apiKey,
            issuerName: dummyIssuerEntityOptions.issuerName
          }
        } as HookContext<IssuerEntityOptions>;
        try {
          validateIssuerCreateOptions(ctx);
          fail();
        } catch (e) {
          expect(e).toEqual(new BadRequest('issuerCustomerUuid is required.'));
        }
      });
    });

    describe('registerIssuerHook', () => {
      it('runs as the second before create hook', () => {
        expect(hooks.before.create[1]).toBe(registerIssuerHook);
      });

      it('throws if data is missing', async () => {
        const ctx = {} as HookContext<IssuerEntityOptions>;

        try {
          await registerIssuerHook(ctx);
          fail();
        } catch (e) {
          expect(e).toEqual(new BadRequest());
        }
      });

      it('calls the server sdk to register a new issuer', async () => {
        mockRegisterIssuer.mockReturnValueOnce(dummyIssuerDto);

        const ctx = {
          data: {
            issuerName: dummyIssuerEntityOptions.issuerName,
            issuerCustomerUuid: dummyIssuerEntityOptions.issuerCustomerUuid,
            apiKey: dummyIssuerEntityOptions.apiKey
          }
        } as HookContext<IssuerEntityOptions>;

        await registerIssuerHook(ctx);
        expect(mockRegisterIssuer).toBeCalledWith(
          dummyIssuerEntityOptions.issuerCustomerUuid,
          dummyIssuerEntityOptions.apiKey,
          'api.corp.com' // from config.APP_URL default value
        );
      });

      it('returns updated context with full IssuerEntityOptions from the sdk', async () => {
        mockRegisterIssuer.mockReturnValueOnce(dummyIssuerDto);

        const ctx = {
          data: {
            issuerName: dummyIssuerEntityOptions.issuerName,
            issuerCustomerUuid: dummyIssuerEntityOptions.issuerCustomerUuid,
            apiKey: dummyIssuerEntityOptions.apiKey
          }
        } as HookContext<IssuerEntityOptions>;

        const newCtx = await registerIssuerHook(ctx) as HookContext<IssuerEntityOptions>;
        expect(newCtx.data).toEqual(dummyIssuerEntityOptions);
      });

      it('logs and re-throws errors from the sdk', async () => {
        mockRegisterIssuer.mockRejectedValueOnce(new Error('sdk error'));

        const ctx = {
          data: {
            issuerName: dummyIssuerEntityOptions.issuerName,
            issuerCustomerUuid: dummyIssuerEntityOptions.issuerCustomerUuid,
            apiKey: dummyIssuerEntityOptions.apiKey
          }
        } as HookContext<IssuerEntityOptions>;

        try {
          await registerIssuerHook(ctx);
          fail();
        } catch (e) {
          expect(logger.error).toBeCalledWith('error registering issuer', e);
          expect(e).toEqual(new Error('sdk error'));
        }
      });
    });
  });
});
