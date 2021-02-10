import { hooks as localAuthHooks } from '@feathersjs/authentication-local';

const { hashPassword } = localAuthHooks;

export default {
  before: {
    create: hashPassword('password')
  }
};
