'use strict';

require('mocha');
const sinon = require('sinon');
const AppBuilder = require('../stubs/appBuilder');
const WaiterController = require('../../app/controller/waiter');
const db = require('../../app/store/db');

describe('Waiter Controller', () => {
  let sandbox;
  let testClient;
  let target;
  const rid = 'r-1';
  const wid = 'w-7';

  function buildWaiterApp() {
    const builder = new AppBuilder();
    /* eslint-disable func-names */
    builder.router
      .get('/api/v1/restaurant/:rid/waiterview',
        function doGet() {
          const ctx = this;
          target = new WaiterController(ctx);
          return target.viewAssignments();
       })
       .get('/api/v1/waiter/:wid/assignments',
        function doGet() {
          const ctx = this;
          target = new WaiterController(ctx);
          return target.viewTablesServed();
      });
    /* eslint-enable func-names */
    return builder.build();
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
    testClient.close();
  });

  describe('get assignments', () => {
    it('should return 200 OK', (done) => {
      const expected = '{"bob":"t-1","tim":"t-5"}';
      db.getAssignedTablesForRestaurant = sandbox.stub()
        .returns([{ wid: 'w-1', tid: 't-1' }, { wid: 'w-5', tid: 't-5' }]);
      db.getDetailsForWaiter = sandbox.stub();
      db.getDetailsForWaiter
        .withArgs('w-1').returns({ name: 'bob' });
      db.getDetailsForWaiter
        .withArgs('w-5').returns({ name: 'tim' });
      testClient = buildWaiterApp();
      testClient
        .get(`/api/v1/restaurant/${rid}/waiterview`)
        .expect(expected)
        .expect(200, done);
    });
  });

  describe('get assignment per waiter', () => {
    it('should return 200 OK', (done) => {
      const expected = 'bob: t-14,t-18,t-19';
      db.getAssignmentsForWaiter = sinon.stub()
        .withArgs('w-7')
        .returns([{ tid: 't-14' }, { tid: 't-18' }, { tid: 't-19' }]);
      db.getDetailsForWaiter = sandbox.stub();
      db.getDetailsForWaiter
        .withArgs('w-7').returns({ name: 'bob' });
      testClient = buildWaiterApp();
      testClient
        .get(`/api/v1/waiter/${wid}/assignments`)
        .expect(expected)
        .expect(200, done);
    });

    it('should return Not found if waiter is not correct', (done) => {
      db.getDetailsForWaiter = sandbox.stub();
      db.getDetailsForWaiter
        .withArgs('w-7').returns(null);
      testClient = buildWaiterApp();
      testClient
        .get(`/api/v1/waiter/${wid}/assignments`)
        .expect(404, done);
    });

    it('should return Not found if no tables are assigned to the waiter', (done) => {
      db.getAssignmentsForWaiter = sinon.stub()
        .withArgs('w-7')
        .returns([]);
      db.getDetailsForWaiter = sandbox.stub();
      db.getDetailsForWaiter
        .withArgs('w-7').returns({ name: 'bob' });
      testClient = buildWaiterApp();
      testClient
        .get(`/api/v1/waiter/${wid}/assignments`)
        .expect(404, done);
    });
  });
});