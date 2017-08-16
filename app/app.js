'use strict';

const Koa = require('koa');
const router = require('./router');
const bodyParser = require('koa-bodyparser');

function makeApp() {
  const app = new Koa();
  app
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());
  return app;
}

module.exports = makeApp;