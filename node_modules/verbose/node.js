var EventEmitter = require('events').EventEmitter;
var StreamEmitter = require('duplex-emitter/emitter');
var InvertStream = require('invert-stream');
var propagate = require('propagate');

var server = require('./server');
var Options = require('./options');
var PeerStream = require('./peer_stream');
var PeerPool = require('./peer_pool');
var MessageHub = require('./message_hub');
var Transport = require('./transport');
var BufferedPeer = require('./buffered_peer');

exports =
module.exports =
function Node(options) {

  /// Options
  options =
  Options(options);

  // State
  var ending = false;
  var ended = false;

  /// Exported stream
  var s = InvertStream();

  /// Internal spine duplex stream to pipe to and from peers
  var spine = s.other;

  /// Peer Pool
  var peers = PeerPool(spine, options);

  /// Returned Emitter
  var e = StreamEmitter(s);
  e.stream = s;

  /// Internal Commands Emitter
  var commands = new EventEmitter();

  // Message Hub
  var messageHub = MessageHub(options);

  e.peers =
  function() {
    return peers.list();
    return e;
  };

  function wireup(peer) {
    peers.add(peer);

    propagate([
      'initialized',
      'connect',
      'disconnect',
      'backoff',
      'reconnect'],
      peer,
      s);

    commands.once('end', function() {
      peer.disconnect();
    });

    commands.once('disconnect', function() {
      peer.disconnect();
    });
  }


  /// Connect

  e.connect =
  function connect(opts, callback) {
    if (ending || ended) throw new Error('Ended');

    var peer = BufferedPeer(options);
    peer.connect(opts);
    wireup(peer);

    return peer;
  }; 


  /// Handle Server Connection

  function handleServerConnection(stream) {
    var peer = BufferedPeer(options, stream);
    wireup(peer);
  }


  /// Listen

  e.listen =
  function listen(port, host, callback) {
    if (ending || ended) throw new Error('Ended');
    if (typeof host == 'function') {
      callback = host;
      host = undefined;
    }

    var server = options.transport.listen(port, host, callback);
    
    server.on('connection', handleServerConnection);
    
    server.once('listening', function() {
      s.emit('listening', port, host);
    });
    
    commands.on('end', function() {
      server.removeListener('connection', handleServerConnection);
      try {
        server.close();
      } catch(err) {
        console.error(err);
      }
    });

    return e;
  };


  /// End

  function end() {
    commands.emit('end');
    peers.end();
    return e;
  };
  e.end = end;

  e.disconnect =
  function disconnect() {
    commands.emit('disconnect');
    return e;
  };

  return e;
};