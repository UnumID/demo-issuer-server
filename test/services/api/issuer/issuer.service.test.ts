import generateApp from '../../../../src/app';

describe('initializing the service', () => {
  it('registers with the app', async () => {
    const app = await generateApp();
    const service = app.service('issuer');
    expect(service).toBeDefined();
  });
});
