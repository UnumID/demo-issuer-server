import { Hook } from '@feathersjs/feathers';
import { IssuerEntity } from '../../entities/Issuer';
import logger from '../../logger';

export const getIssuerEntity: (did: string) => Hook = (did: string) => async (ctx) => {
  console.log('getIssuerEntity');
  console.log('did', did);
  const issuerDataService = ctx.app.service('issuerData');
  let issuerEntity: IssuerEntity;
  try {
    issuerEntity = await issuerDataService.getByDid(did);
    console.log('issuerEntity', issuerEntity);

    return {
      ...ctx,
      params: {
        ...ctx.params,
        issuerEntity
      }

    };
  } catch (e) {
    logger.error('getIssuerEntity hook caught an error thrown by issuerDataService.getByDid', e);
    throw e;
  }
};
