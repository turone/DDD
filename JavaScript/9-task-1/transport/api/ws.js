'use strict';

//const console = require('./logger.js');
//const { parse } = require('node:url');
const { WebSocketServer } = require('ws');

module.exports = (routing, options, console) => {

  //console.log(options);

  const ws = new WebSocketServer({ noServer: true, rejectUnauthorized: false });



  ws.on('connection', (connection, req) => {
    //console.dir(connection);
    const ip = req.socket.remoteAddress;
    connection.on('message', async (message) => {
      const obj = JSON.parse(message);
      const { name, method, args = [] } = obj;
      const entity = routing[name];
      if (!entity) return connection.send('"Not found"', { binary: false });
      const handler = entity[method];
      if (!handler) return connection.send('"Not found"', { binary: false });
      const json = JSON.stringify(args);
      const parameters = json.substring(1, json.length - 1);
      console.log(`${ip} ${name}.${method}(${parameters})`);
      try {
        const result = await handler(...args);
        connection.send(JSON.stringify(result.rows), { binary: false });
      } catch (err) {
        console.error(err);
        connection.send('"Server error"', { binary: false });
      }
    });
  });
  options.server.on('upgrade', function upgrade(request, socket, head) {
    //console.log(request.url);

    console.log(options.apiServer.path, request.url);
    if (options.apiServer.path === request.url) {

      ws.handleUpgrade(request, socket, head, (ws1) => {
        ws.emit('connection', ws1, request);
      });
    } else {
      socket.destroy();

    }
  });




  // console.log(`API on port `);
};
