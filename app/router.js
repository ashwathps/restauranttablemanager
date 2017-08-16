'use strict';

const Router = require('koa-router');
const WaiterController = require('./controller/waiter');
const ManagerController = require('./controller/manager');
const AuthorizationMiddleware = require('./middleware/authorization');
const ContentMiddleware = require('./middleware/content');

const router = new Router();

router.use(function* attachToRequest(next) {
  this.router = router;
  yield next;
});

router.get('/api/v1/waiter/:wid/assignments',
  function getTableAssignments() {
    new WaiterController(this).viewTablesServed();
  });

router.get('/api/v1/restaurant/:rid/waiterview',
  function getTables() {
    new WaiterController(this).viewAssignments();
  });

router.get('/api/v1/restaurant/:rid/managerview',
  function getTables() {
    new ManagerController(this).viewAssignments();
  });

router.put('/api/v1/restaurant/:rid/table/:tid',
  ContentMiddleware.requireJson,
  AuthorizationMiddleware.authorizedToAssignWaiter,
  function assignWaiterToTable() {
    new ManagerController(this).assignWaiter();
  });

router.delete('/api/v1/restaurant/:rid/table/:tid',
  ContentMiddleware.requireJson,
  AuthorizationMiddleware.authorizedToAssignWaiter,
  function unassignWaiterToTable() {
    new ManagerController(this).unassignWaiter();
  });

module.exports = router;
