'use strict';
const createServer = (protocol) => (protocol === 'http2') ? require(`node:http2`).createSecureServer : require(`node:${protocol}`).createServer;
//const staticServer= (protocol) => require(`node:${protocol}`);
const path = require('node:path');
const fs = require('node:fs');

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};
const HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const toBool = [() => true, () => false];

const prepareFile = async (url, root) => {
  const STATIC_PATH = path.join(process.cwd(), root);
  const paths = [STATIC_PATH, url];
  if (url.endsWith('/')) paths.push('index.html');
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const found = !pathTraversal && await fs.promises.access(filePath).then(...toBool);
  const streamPath = found ? filePath : STATIC_PATH + '/404.html';
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

const requestListener = (root, addRouteRequest) => (!addRouteRequest) ? async (req, res) => {
  const file = await prepareFile(req.url, root);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { ...HEADERS, 'Content-Type': mimeType });
  file.stream.pipe(res);
  console.log(`${req.method} ${req.url} ${statusCode}`);

} : async (req, res) => {
  if (!await addRouteRequest(req, res)) return;
  const file = await prepareFile(req.url, root);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { ...HEADERS, 'Content-Type': mimeType });
  file.stream.pipe(res);
  console.log(`${req.method} ${req.url} ${statusCode}`);

}

module.exports = (configServer, console) => {
  //console.log(configServer);
  return createServer(configServer.type)(configServer.optionsStatic, requestListener(configServer.path, configServer.addRouteRequest)).listen(configServer.port, () => {
    console.log(`Listen port ${configServer.port}`);
  });

  // console.log(`Static on port ${port}`);
};
