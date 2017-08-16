'use-strict';

const store = require('../store/db');
const ld = require('lodash');
const { HTTP_STATUS } = require('../constants/http');

class ManagerController {

  constructor(ctx) {
    this.context = ctx;
  }
  /* eslint-disable no-param-reassign */
  // PUT /restaurant/r-1/table/t-1
  assignWaiter() {
    const params = this.context.params;
    const body = this.context.request.body;
    let assigns = {};

    const waiter = store.getDetailsForWaiter(body.wid);
    if (!waiter) {
      this.context.response.body = `No such waiter ${body.wid}`;
      this.context.response.status = HTTP_STATUS.NOT_FOUND;
      return;
    }
    // check if table is already assigned to someother waiter
    assigns = store.getAssignmentForTable(params.tid);
    if (assigns) {
      this.context.response.body = `Table already Assigned to ${assigns.wid}`;
      this.context.response.status = HTTP_STATUS.BAD_REQUEST;
      return;
    }
    // get the tables assigned to the waiter
    const tables = store.getAssignmentsForWaiter(body.wid);
    if (tables.length >= 4) {
      // Constraint: no waiter can do more than 4 tables at a time.
      let otherWaiters = ld.groupBy(store.getAllAssignments(), { wid: body.wid }).false;
      otherWaiters = otherWaiters.concat(store.getAllWaiters());
      if (otherWaiters.length === 0) {
        this.context.response.body = 'All waiters are busy right now';
        this.context.response.status = HTTP_STATUS.FORBIDDEN;
      } else {
        this.context.response.body = `Waiter ${body.wid} busy, choose among ${ld.uniq(ld.map(otherWaiters, 'wid'))}`;
        this.context.response.status = HTTP_STATUS.BAD_REQUEST;
      }
      return;
    }

    assigns = ld.find(tables, { tid: params.tid });
    if (assigns) {
      this.context.response.body = 'Waiter already assigned to this table';
      this.context.response.status = HTTP_STATUS.OK;
      return;
    }
    store.assignWaiterForTable(params.rid, body.mid, params.tid, body.wid);
    this.context.response.body = 'Waiter assigned';
    this.context.response.status = HTTP_STATUS.OK;
  }
  // DEL /restaurant/r-1/table/t-1
  unassignWaiter() {
    const params = this.context.params;
    const body = this.context.request.body;

    const waiter = store.getDetailsForWaiter(body.wid);
    if (!waiter) {
      this.context.response.body = `No such waiter ${body.wid}`;
      this.context.response.status = HTTP_STATUS.NOT_FOUND;
      return;
    }
    store.unassignWaiterForTable(params.rid, body.mid, params.tid, body.wid);
    this.context.response.body = 'Waiter unassigned';
    this.context.response.status = HTTP_STATUS.OK;
  }

  // GET /restaurant/r-1/managerview
  viewAssignments() {
    const params = this.context.params;

    const assignedTables = store.getAssignedTablesForRestaurant(params.rid);
    const allTables = store.getTablesInRestaurant(params.rid);

    const combinedTable = ld.unionBy(assignedTables, allTables, t => t.tid);

    const response = ld.map(combinedTable, (t) => {
      const waiter = store.getDetailsForWaiter(t.wid);
      t.waiterName = waiter ? waiter.name : 'Unassigned';
      return `${t.tid}: ${t.waiterName}`;
    });

    this.context.response.body = response;
    this.context.response.status = HTTP_STATUS.OK;
  }
  /* eslint-enable no-param-reassign */
}

module.exports = ManagerController;