'use strict';

const { createServer } = (protocol) => require(`node:${protocol}`);

const HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=UTF-8',
};

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

module.exports = (routing, configServer, console) => {
  const requestListener = async (req, res) => {
    // console.log(configServer);
   

    const { url, socket } = req;
    const [place, name, method] = url.substring(1).split('/');
    if (place !== 'api') {
      if (configServer.getListener) return true;
      return res.end('"Not found -place"');
    }
    res.writeHead(200, HEADERS);
    if (req.method !== 'POST') return res.end('"Not found post"');
    const entity = routing[name];
    if (!entity) return res.end('"Not found entity"');
    const handler = entity[method];
    if (!handler) return res.end('"Not found"');
    const { args } = await receiveArgs(req);
    const result = (await handler(...args));
    res.end(JSON.stringify(result));
  };
  if (configServer.getListener) return requestListener;

  if (configServer.server) return configServer.server.on('request', requestListener);
  const server = createServer(configServer.protocol)(configServer.options, requestListener).listen(configServer.port)

  console.log(`API on port ${configServer.port}`);
  return server;
};
