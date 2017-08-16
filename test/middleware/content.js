require('mocha');
const AppBuilder = require('../stubs/appBuilder');
const ContentMiddleware = require('../../app/middleware/content');

describe('JSON', () => {
  let testClient;

  function buildTestApp() {
    const builder = new AppBuilder();

    function endpoint() {
      this.response.body = 'Ok';
      this.status = 200;
    }

    builder.router
      .use(ContentMiddleware.requireJson())
      .get('/test', endpoint)
      .post('/test', endpoint);
    return builder.build();
  }

  beforeEach(() => {
    testClient = buildTestApp();
  });

  afterEach(() => {
    testClient.close();
  });

  describe('requireJson', () => {
    it('should allow json requests', (done) => {
      testClient
        .post('/test')
        .send({})
        .expect(200, done);
    });
    it('should allow requests for HTTP methods that support content but not provided', (done) => {
      testClient
        .post('/test')
        .expect(200, done);
    });
    it('should allow requests for HTTP methods that do not support content', (done) => {
      testClient
        .get('/test')
        .expect(200, done);
    });
  });
});
