const debug = require('debug');

// Create namespaced debug functions
module.exports = {
  server: debug('andro:server'),
  socket: debug('andro:socket'),
  db: debug('andro:database'),
  client: debug('andro:client'),
  apk: debug('andro:apk-builder'),
  route: debug('andro:routes')
};