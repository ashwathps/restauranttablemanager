'use strict';

require('mocha');
const sinon = require('sinon');
const AppBuilder = require('../stubs/appBuilder');
const ManagerController = require('../../app/controller/manager');
const db = require('../../app/store/db');

describe('Manager Controller', () => {
  let sandbox;
  let testClient;
  let target;
  const rid = 'r-1';

  function buildManagerApp() {
    const builder = new AppBuilder();
    /* eslint-disable func-names */
    builder.router
      .get('/api/v1/restaurant/:rid/managerview',
        function doGet() {
          const ctx = this;
          target = new ManagerController(ctx);
          return target.viewAssignments();
       })
      .put('/api/v1/restaurant/:rid/table/:tid',
        function doPut() {
          const ctx = this;
          target = new ManagerController(ctx);
          target.assignWaiter();
      })
      .del('/api/v1/restaurant/:rid/table/:tid',
        function doDel() {
          const ctx = this;
          target = new ManagerController(ctx);
          target.unassignWaiter();
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

  function validRequest(wid) {
    return {
      mid: 'm-1',
      wid,
    };
  }

  function validAssignments() {
    return [
      { rid: 'r-1', mid: 'm-1', tid: 't-1', wid: 'w-1' },
      { rid: 'r-1', mid: 'm-1', tid: 't-2', wid: 'w-1' },
    ];
  }

  describe('get assignments', () => {
    it('should return 200 OK', (done) => {
      testClient = buildManagerApp();
      testClient
        .get(`/api/v1/restaurant/${rid}/managerview`)
        .expect(200, done);
    });

    it('should return the current table assignments if present', (done) => {
      db.getAssignedTablesForRestaurant = sandbox.stub().returns([]);
      db.getTablesInRestaurant = sandbox.stub().returns([]);
      const expected = [];
      testClient = buildManagerApp();
      testClient
        .get(`/api/v1/restaurant/${rid}/managerview`)
        .expect(expected)
        .expect(200, done);
    });

    it('should return the current table assignments', (done) => {
      const data = validAssignments();
      db.getAssignedTablesForRestaurant = sandbox.stub().returns(data);
      db.getTablesInRestaurant = sandbox.stub().returns([]);
      db.getDetailsForWaiter = sandbox.stub().withArgs('w-1').returns({ name: 'bob' });

      const expected = '["t-1: bob","t-2: bob"]';
      testClient = buildManagerApp();
      testClient
        .get(`/api/v1/restaurant/${rid}/managerview`)
        .expect(expected)
        .expect(200, done);
    });

    it('should return assignments and unassigned', (done) => {
      const data = validAssignments();
      db.getAssignedTablesForRestaurant = sandbox.stub().returns(data);
      db.getTablesInRestaurant = sandbox.stub().returns([{ tid: 't-3', wid: null }]);
      db.getDetailsForWaiter = sandbox.stub();
      db.getDetailsForWaiter
        .withArgs('w-1')
        .returns({ name: 'boby' });
      db.getDetailsForWaiter
        .withArgs(null)
        .returns(null);

      const expected = '["t-1: boby","t-2: boby","t-3: Unassigned"]';
      testClient = buildManagerApp();
      testClient
        .get(`/api/v1/restaurant/${rid}/managerview`)
        .expect(expected)
        .expect(200, done);
    });
  });

  describe('assign waiters', () => {
    it('should assign waiter if he is free', (done) => {
      db.getDetailsForWaiter = sinon.stub().withArgs('w-5').returns({ name: '' });
      const expected = 'Waiter assigned';
      testClient = buildManagerApp();
      testClient
        .put(`/api/v1/restaurant/${rid}/table/t-20`)
        .send(validRequest('w-5'))
        .expect(expected)
        .expect(200, done);
    });

    it('should indicate if waiter is already assigned to same table', (done) => {
      const expected = 'Waiter already assigned to this table';
      db.getAssignmentForTable = sinon.stub().withArgs('t-14').returns(null);
      db.getAssignmentsForWaiter = sinon.stub().withArgs('w-7').returns([{ tid: 't-14' }]);
      testClient = buildManagerApp();
      testClient
        .put(`/api/v1/restaurant/${rid}/table/t-14`)
        .send(validRequest('w-7'))
        .expect(expected)
        .expect(200, done);
    });

    it('should not assign if table is already assigned', (done) => {
      db.getDetailsForWaiter = sinon.stub().withArgs('w-2').returns({});
      db.getAssignmentForTable = sinon.stub().withArgs('t-1').returns({ wid: 'w-1' });
      const expected = 'Table already Assigned to w-1';
      testClient = buildManagerApp();
      testClient
        .put(`/api/v1/restaurant/${rid}/table/t-1`)
        .send(validRequest('w-2'))
        .expect(expected)
        .expect(400, done);
    });

    it('should not assign if busy and provide alternatives', (done) => {
      db.getDetailsForWaiter = sinon.stub().withArgs('w-2').returns({});
      db.getAssignmentForTable = sinon.stub().withArgs('t-15').returns(null);
      db.getAssignmentsForWaiter = sinon.stub()
        .withArgs('w-2')
        .returns([{ tid: 't-14' }, { tid: 't-17' }, { tid: 't-18' }, { tid: 't-19' }]);

      testClient = buildManagerApp();
      testClient
        .put(`/api/v1/restaurant/${rid}/table/t-15`)
        .send(validRequest('w-2'))
        .expect(400, done);
    });

    it('should not assign if waiter doesnt exist', (done) => {
      db.getDetailsForWaiter = sinon.stub().withArgs('w-9').returns(null);
      const expected = 'No such waiter w-9';
      testClient = buildManagerApp();
      testClient
        .put(`/api/v1/restaurant/${rid}/table/t-17`)
        .send(validRequest('w-9'))
        .expect(expected)
        .expect(404, done);
    });
  });

  describe('unassign waiters', () => {
    it('should unassign waiter if he is allocated', (done) => {
      db.getDetailsForWaiter = sinon.stub().withArgs('w-5').returns({ name: '' });
      const expected = 'Waiter unassigned';
      testClient = buildManagerApp();
      testClient
        .del(`/api/v1/restaurant/${rid}/table/t-20`)
        .send(validRequest('w-5'))
        .expect(expected)
        .expect(200, done);
    });

    it('should check waiter before unassigning a waiter', (done) => {
      db.getDetailsForWaiter = sinon.stub().withArgs('w-5').returns(null);
      const expected = 'No such waiter w-5';
      testClient = buildManagerApp();
      testClient
        .del(`/api/v1/restaurant/${rid}/table/t-20`)
        .send(validRequest('w-5'))
        .expect(expected)
        .expect(404, done);
    });
  });
});

