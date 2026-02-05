var net = require('net');

function create() {
  return net.createServer();
}

module.exports = {
  create: create
};