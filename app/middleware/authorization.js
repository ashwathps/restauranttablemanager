
'use strict';

const { HTTP_STATUS } = require('../constants/http');
const db = require('../store/db');

class AuthorizationMiddleware {
  static* authorizedToAssignWaiter(next) {
    const mid = this.request.body.mid;
    const rid = this.params.rid;
    if (!mid) {
      console.log('Invalid request: Manager id is required');
      this.throw(HTTP_STATUS.BAD_REQUEST);
    }
    const restaurants = db.getRestaurantForManager(rid, mid);
    if (restaurants.length === 0) {
      console.log(`Invalid request: Manager ${mid} not authorized to assign`);
      this.throw(HTTP_STATUS.UNAUTHORIZED);
    }
    yield next;
  }
}

module.exports = AuthorizationMiddleware;