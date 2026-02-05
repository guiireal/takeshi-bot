var Stream = require('stream');
var propagate = require('propagate');
var domain = require('domain');
var uuid = require('node-uuid');

var Options = require('./options');
var Messages = require('./messages');
var Protocol = require('./peer_protocol');


exports =
module.exports =
function PeerStream(remoteStream, opts) {
  
  /// Parse options
  
  var options = Options(opts);
  var nodeId = options.node_id;

  /// s is the returned stream:
  
    var s = new Stream();
    s.writable = true;
    s.readable = true;
    s.ended = false;

  /// Domain and error handling

    var d = domain.create();
    d.add(remoteStream);
    d.on('error', function(err) {
      if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
        // The server was not there.
        // Let's just quit and let reconnect kick in
        remoteStream.end();
      } else s.emit('error', err);
    });

  
  /// Messages Buffer

    var messages = Messages({
      maxMessages: options.bufferMax,
      timeout:     options.bufferTimeout
    });

    s.takeMessages =
    function takeMessages(_messages) {
      if (_messages) messages = _messages;
    };

    s.pendingMessages =
    function pendingMessages() {
      return messages;
    };

    s.lockPendingMessages =
    function lockPendingMessages() {
      messages = null;
    };

    /// Resend since
    function resendSince(id) {
      var m;
      messages.acknowledge(id);
      while(m = messages.next()) {
        protocol.message(m);
      }
    }

    /// Buffer length
    s.bufferLength =
    function bufferLength() {
      return messages.length();
    };



  /// Protocol

    var protocol = Protocol(remoteStream, options, s);
    
    function onError(err) {
      s.emit('error', err);
    }

    protocol.on('error', onError);

    protocol.once('peerid', function(peerId) {
      s.peerId = peerId;
      s.emit('peerid', peerId);
    });
    
    protocol.once('initialized', function(lastMessageId, isReconnect) {
      if (lastMessageId || isReconnect) resendSince(lastMessageId);
      s.emit('initialized');
    });

    function onRemoteMessage(msg) {
      s.emit('data', msg);
      s.lastMessageId = msg._id;
    }

    function onRemoteAcknowledge(id) {
      messages.acknowledge(id);
      resetAcknowledgeTimeout();
      s.emit('acknowledge', id);
    }

    protocol.on('message', onRemoteMessage);
    protocol.on('acknowledge', onRemoteAcknowledge);

    // Propagate some events from the protocol into the stream
    var p = propagate(['drain'], protocol, s);

    function acknowledge() {
      if (s.lastMessageId) protocol.acknowledge(s.lastMessageId);
    }
    var ackInterval = setInterval(acknowledge, options.acknowledgeInterval);

    var ackTimeout;
    function resetAcknowledgeTimeout() {
      if (ackTimeout) clearTimeout(ackTimeout);
      
      ackTimeout = setTimeout(function() {
        s.emit('timeout');
        if (remoteStream) remoteStream.destroy();
      }, options.timeout);
    }

    protocol.once('end', function() {
      
      // Remove event listeners
      protocol.removeListener('error', onError);
      protocol.removeListener('message', onRemoteMessage);
      protocol.removeListener('acknowledge', onRemoteAcknowledge);
      
      // Clear intervals and timeouts
      clearInterval(ackInterval);
      if (ackTimeout) clearTimeout(ackTimeout);
      ackTimeout = undefined;
      
      /// Cancel the messages timeout timer
      //    Doing this in the next tick because there may be some leftover
      //    events to process.
      process.nextTick(function() {
        messages.dropTimeout();
      });

      // end event propagation from protocol
      p.end();

      // mark the stream as ended
      s.ended = true;
      
      // Stream emits the end event
      s.emit('end');
    });


  /// Write

  s.write =
  function write(msg) {
    if (typeof msg != 'object') throw new Error('a message must be an object. ' + (typeof msg) + ' is not acceptable.');
    if (! msg._id) msg._id = uuid.v4();
    if (! msg._nodes) msg._nodes = [];

    messages.push(msg);
    return protocol.message(msg);
  };

  /// End

  s.end =
  function end(msg) {
    protocol.end();
  };

  protocol.initialize();

  return s;
};