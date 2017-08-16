'use strict';

const Koa = require('koa');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');
const server = require('supertest');

class AppBuilder {
  constructor() {
    this.router = new KoaRouter();
  }
  build() {
    const app = new Koa();
    app
      .use(bodyParser())
      .use(this.router.routes())
      .use(this.router.allowedMethods());
    app.router = this.router;
    const client = server.agent(app.listen());
    client.close = function () {
      client.app.close();
    };
    return client;
  }
}

module.exports = AppBuilder;
