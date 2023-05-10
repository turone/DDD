'use strict';

const http = require('node:http');

const receiveArgs = async (req) => {
  console.log('recieveArgs' + req.url)
};

module.exports = function func(port) {
  http.createServer(async (req, res) => {
    (await receiveArgs(req));


    res.end('htttpkk');
  }).listen(port);

  console.dir();
}
