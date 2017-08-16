require('mocha');
const AppBuilder = require('../stubs/appBuilder');
const AuthMiddleware = require('../../app/middleware/authorization');
const db = require('../../app/store/db');
const sinon = require('sinon');

describe('Auth', () => {
  let testClient;
  let sandbox;
  function buildTestApp() {
    const builder = new AppBuilder();

    function endpoint() {
      this.response.body = 'Ok';
      this.status = 200;
    }

    builder.router
      .put('/test/:rid', AuthMiddleware.authorizedToAssignWaiter, endpoint);
    return builder.build();
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    testClient = buildTestApp();
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
    testClient.close();
  });

  it('should pass through if manager is authorized to assign', (done) => {
    testClient
      .put('/test/r-1')
      .send({ mid: 'm-1' })
      .expect(200, done);
  });

  it('should throw if manager is not authorized to assign', (done) => {
    db.getRestaurantForManager = sandbox.stub().returns([]);
    testClient
      .put('/test/r-1')
      .send({ mid: 'm-1' })
      .expect(401, done);
  });
});