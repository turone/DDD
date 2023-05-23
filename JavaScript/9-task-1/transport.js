//const http = require('./transport/api/http');

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

const apiModules = new Map();
const staticModule = require('./transport/static.js'); const ws = require('./ws.js');
;
const loadApi = async (api) => api.map(path => apiModules.set(path, require(`./transport/api/${path}.js`)));
const loadCert = (certOptions) => {
  const path = require('node:path');
  const fs = require('node:fs');
  const cert = {
    key: fs.readFileSync(path.join(process.cwd(), certOptions.key)),
    cert: fs.readFileSync(path.join(process.cwd(), certOptions.cert)),
  };
  return cert;
}
let allRequest = false;

const addRouteRequest = (addRequest) => {

  if (allRequest) {
    allRequest = (...args) => {
      allRequest(...args);
      addRequest(...args);
    }
  } else { allRequest = addRequest; }
}


module.exports = async (routing, config, console) => {
  let optionsStatic = {};
  let { oneport, staticServer, apiServer, certOptions } = config;
  if (staticServer.secured) { console.log(optionsStatic = loadCert(certOptions)); }
  if (staticServer.type==='http2'){ optionsStatic.allowHTTP1= true;}
  const apiOptions = {};
  let transport = new Map();

  await loadApi(config.apiServer.type);
  if (oneport) {
    for (const api of apiModules.keys()) {
      if (api.startsWith('http')) {
        addRouteRequest(apiModules.get(api)(routing, { getListener: true }, console));
      }
    }
    const configStatic = Object.assign({}, { optionsStatic }, config.staticServer, { addRouteRequest: allRequest });
    transport.set('staticServer', staticModule(configStatic, console));
    if (apiModules.has('ws')) {
      apiOptions.ws = { server: transport.get('staticServer'), oneport, apiServer, rejectUnauthorized: !certOptions.selfSigned };
      apiModules.get('ws')(routing, apiOptions.ws, console);
    }
  }

  //console.dir(apiModules);

};