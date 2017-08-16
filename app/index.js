'use strict';

const http = require('http');
const App = require('./app');

const app = new App();

console.log('Starting Restaurant API');

const port = process.env.HTTP_PORT || 8009;
console.log(`Listening on port ${port}`); // eslint-disable-line no-console

http
  .createServer(app.callback())
  .listen(port);
