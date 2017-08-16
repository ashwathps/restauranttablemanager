
'use strict';

const compose = require('koa-compose');
const bodyParser = require('koa-bodyparser');
const { HTTP_STATUS } = require('../constants/http');

class ContentMiddleware {
  static* assertJson(next) {
    if (this.request.length) {
      if (!this.request.is('json')) {
        this.throw(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, 'Body must be JSON. Is content-type set?');
      }
    }
    yield next;
  }

  static requireJson() {
    const middlewares = [
      bodyParser({
        enableTypes: ['json'],
      }),
      ContentMiddleware.assertJson,
    ];
    return compose(middlewares);
  }
}

module.exports = ContentMiddleware;