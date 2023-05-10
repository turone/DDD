'use strict';

module.exports = {
  static: {
    port: 443,
  },
  api: {
    port: 443,
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
  db: {
    host: '127.0.0.1',
    port: 5432,
    database: 'example',
    user: 'marcus',
    password: 'marcus',
  },
  transport:
  {
    oneport: true,
    staticServer: { type: 'https', port: 443, path: './static', secured: true },
    apiServer: { type: ['ws', 'https'], port: 443, path: '/api/' },
    certOptions: {
      key: '/config/key/localhost-privkey.pem',
      cert: '/config/key/localhost-cert.pem',
      selfSigned: true,
    }
  }
};
