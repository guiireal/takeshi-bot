var net = require('net');
var duplexEmitter = require('duplex-emitter');
var uuid = require('node-uuid');

module.exports =
function MockServer(options) {
  var server = net.createServer();
  server.acknowledge = true;
  var conns = [];
  
  server.on('connection', function(stream) {
    conns.push(stream);
    var remoteEmitter =
    stream.remoteEmitter =
    duplexEmitter(stream);

    remoteEmitter.emit('peerid', options.channel, options.node_id);
    remoteEmitter.emit('sync', server.sync, false);
    
    remoteEmitter.on('message', function(m) {
      server.emit('message', m);
      if (server.acknowledge) remoteEmitter.emit('ack', m.meta._id);
    });

    remoteEmitter.on('ack', function(id) {
      server.emit('ack', id);
    });

    if (server.send) {
      server.send.forEach(function(msg) {
        var args = msg;
        if (! Array.isArray(args)) args = [args, {nodes: [], id: uuid.v4()}];
        args.unshift('message');
        remoteEmitter.emit.apply(remoteEmitter, args);
      });
    }

  });

  server.forceClose = function() {
    server.close();
    conns.forEach(function(conn) {
      conn.destroy();
    });
    conns = [];
  };

  return server;
};