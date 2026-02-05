var net = require('net');
var reconnect = require('reconnect');

function connect(options, connHandler, callback) {
  if (typeof options != 'object') {
    options = {
      port: options
    };
  }

  if (! options.port) throw new Error('Need a port to connect to');

  recon = reconnect(connHandler);
  recon.connect(options);
  return recon;
}

function listen(port, host, callback) {
  if (typeof host == 'function') {
    callback = host;
    host = undefined;
  }
  var server = net.createServer();
  if (callback) server.once('listening', callback);
  server.listen(port, host);
  return server;
}

module.exports = {
  connect: connect,
  listen: listen
};