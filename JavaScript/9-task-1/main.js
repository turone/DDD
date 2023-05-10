'use strict';
const config = require('./config/config.js');
const fsp = require('node:fs').promises;
const path = require('node:path');
const server = require('./ws.js');
const staticServer = require('./transport/static.js');
const load = require('./load.js');
const db = require('./db.js');
const hash = require('./hash.js');
const logger = require('./logger.js');

const sandbox = {
  console: Object.freeze(logger),
  db: Object.freeze(db),
  common: { hash },
};
const apiPath = path.join(process.cwd(), './api');
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith('.js')) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, '.js');
    routing[serviceName] = await load(filePath, sandbox);
  }
  //console.log(routing);
  // const webServer = staticServer('./static', config.transport.staticServer.type);
  /* webServer.listen(config.static.port, () => {
     console.log('Listen port 8000');
   });*/
  // server(routing, webServer, logger);
  require('./transport.js')(routing, config.transport, console);
})();
