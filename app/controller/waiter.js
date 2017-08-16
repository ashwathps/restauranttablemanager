'use-strict';

const store = require('../store/db');
const ld = require('lodash');
const { HTTP_STATUS } = require('../constants/http');

class WaiterController {

  constructor(ctx) {
    this.context = ctx;
  }
  /* eslint-disable no-param-reassign */
  viewTablesServed() {
    const wid = this.context.params.wid;

    const waiter = store.getDetailsForWaiter(wid);
    if (!waiter) {
      this.context.response.status = HTTP_STATUS.NOT_FOUND;
      return;
    }
    const tables = store.getAssignmentsForWaiter(wid);

    if (tables.length === 0) {
      this.context.response.status = HTTP_STATUS.NOT_FOUND;
      return;
    }

    this.context.response.body = `${waiter.name}: ${ld.map(tables, 'tid')}`;
    this.context.response.status = HTTP_STATUS.OK;
  }

  static formatResponse(data) {
    return ld.mapValues(data, v => v.join(', '));
  }
  // GET /restaurant/r-1/waiterview
  viewAssignments() {
    const params = this.context.params;

    const allTables = store.getAssignedTablesForRestaurant(params.rid);

    const extTables = ld.map(allTables, (t) => {
      const waiter = store.getDetailsForWaiter(t.wid);
      t.waiterName = waiter.name;
      return t;
    });

    const result = ld.reduce(extTables, (res, value) => {
      (res[value.waiterName] || (res[value.waiterName] = [])).push(value.tid);
      return res;
    }, {});
    this.context.response.body = WaiterController.formatResponse(result);
    this.context.response.status = HTTP_STATUS.OK;
  }
  /* eslint-enable no-param-reassign */
}

module.exports = WaiterController;