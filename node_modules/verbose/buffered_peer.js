var Stream = require('stream');
var propagate = require('propagate');

var PeerStream = require('./peer_stream');

module.exports =
function BufferedPeer(options, stream) {

  var buffer = [];
  var peerStream;
  var recon;

  var s = new Stream();
  s.readable = true;
  s.writable = true;


  /// Handle new connections

  function handleConnection(stream) {

    var oldPeerStream = peerStream;
    peerStream = PeerStream(stream, options);

    /// If there is an old peer, let's hand-off the pending messages
    if (oldPeerStream) {
      peerStream.takeMessages(oldPeerStream.pendingMessages());
      peerStream.lastMessageId = oldPeerStream.lastMessageId;
      peerStream.isReconnect = true;
      oldPeerStream.lockPendingMessages();
    }

    peerStream.on('data', function(d) {
      s.emit('data', d);
    });

    buffer.forEach(function(m) {
      peerStream.write(m);
    });
    buffer = [];

    propagate([
      'initialized',
      'peerid',
      'acknowledge',
      'end'],
      peerStream, s);

    /// Hand-off all the errors from stream
    peerStream.on('error', function(err) {
      s.emit('error', err);
    });
  }


  /// Connect

  s.connect =
  function connect(opts, callback) {
    if (recon) throw new Error('Already trying to connect');
    recon = options.transport.connect(opts, handleConnection, callback);

    propagate([
      'connect',
      'disconnect',
      'backoff',
      'reconnect'],
      recon, s);

  };
  

  /// Disconnect

  s.end =
  s.disconnect =
  function disconnect() {
    if (peerStream) {
      peerStream.once('end', function() {
        s.emit('end');
      });
      if (recon) recon.reconnect = false;
      peerStream.end();
    } else {
      s.emit('end');
    }
  };


  /// Write

  s.write =
  function write(b) {
    if (! peerStream) {
      buffer.push(b);
      return true;
    } else {
      console.log('writing to peer stream', b);
      return peerStream.write(b);
    }
  };


  /// Take Messages

  s.takeMessages =
  function takeMessages(m) {
    if (! peerStream) throw new Error('No peer stream');
    return peerStream.takeMessages(m);
  };


  /// Pending Messages

  s.pendingMessages =
  function pendingMesages() {
    if (! peerStream) return null;
    return peerStream.pendingMessages();
  };


  /// lastMessageId
  
  s.__defineSetter__('lastMessageId', function(lastMessageId) {
    if (! peerStream) throw new Error('no peer stream');
    peerStream.lastMessageId = lastMessageId;
  });


  /// isReconnect
  
  s.__defineSetter__('isReconnect', function(isReconnect) {
    if (! peerStream) throw new Error('no peer stream');
    peerStream.isReconnect = isReconnect;
  });



  /// Already connected?

  if (stream) handleConnection(stream);

  return s;
};