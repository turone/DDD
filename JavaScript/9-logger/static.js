'use strict';

const staticServer= (protocol) => require(`node:${protocol}`);
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

const toBool = [() => true, () => false];

const prepareFile = async (url,root) => {
  const STATIC_PATH = path.join(process.cwd(), root);
  const paths = [STATIC_PATH, url];
  if (url.endsWith('/')) paths.push('index.html');
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH); 
  const found = !pathTraversal &&  await fs.promises.access(filePath).then(...toBool);
  const streamPath = found ? filePath : STATIC_PATH + '/404.html';
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

module.exports = (root, protocol) => {
  
 const server= staticServer(protocol).createServer(async (req, res) => {
    const file = await prepareFile(req.url,root);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    res.writeHead(statusCode, { 'Content-Type': mimeType });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);

  });
  server.listen(8000, () => {
    console.log('Listen port 8000');
  })
  return server;
 // console.log(`Static on port ${port}`);
};
