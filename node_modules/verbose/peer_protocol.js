var DuplexEmitter = require('duplex-emitter');
var EventEmitter = require('events').EventEmitter;
var uuid = require('node-uuid');
var slice = Array.prototype.slice;

exports =
module.exports =
function PeerProtocol(remoteStream, options, state) {

  if (! state) state = {};

  var nodeId = options.node_id;

  /// Returned emitter
  var e = new EventEmitter();
  
  /// Protocol State
  var initialized = false;
  var ended = false;
  var peerId;

  /// Make duplex emitter from raw stream
  var remoteEmitter = DuplexEmitter(remoteStream);


  /// Command Queue

  var queue = [];
  function enqueue() {
    queue.push(slice.call(arguments));
  }

  function flush(err) {
    if (err) return e.emit('error', err);
    if (queue.length) {
      var action = queue[0];
      var method = action[0];
      var args = action.slice(1);
      
      // Drop this if stream is not active
      if ((ended || ! initialized) && (method == message)) return;

      // we're continuing with this queue item
      // remove it from the queue
      queue.splice(0, 1);

      // push in the callback function
      // as the last argument
      args.push(flush);

      // call the action method
      method.apply(this, args);
    } else {
      e.emit('drain');
    }
  }


  /// Initialize

  var timeout;

  e.initialize =
  function initialize() {
    if (initialized) throw new Error('Already initialized');
    if (ended)  throw new Error('Ended');

    remoteEmitter.emit('peerid', options.channel, nodeId);
    timeout = setTimeout(function() {
      e.emit('error', new Error(
        'timeout waiting for channel handshake. Waited for ' + options.timeout + ' ms'));
      e.end();
    }, options.timeout);

    remoteEmitter.once('peerid', function(channel, remotePeerId) {
      peerId = remotePeerId;
      if (channel != options.channel) {
        clearTimeout(timeout);
        timeout = undefined;
        return e.emit('error',
          new Error(
            'wrong channel name: ' + channel + '. Expected ' + options.channel));
      }

      remoteEmitter.once('sync', function(lastMessageId, isReconnect) {
        clearTimeout(timeout);
        timeout = undefined;
        e.emit('initialized', lastMessageId, isReconnect);

        initialized = true;

        process.nextTick(flush);

      });

      e.emit('peerid', remotePeerId);

      remoteEmitter.emit('sync', state.lastMessageId, state.isReconnect);

    });

    remoteEmitter.on('error', function(err) {
      e.emit('error', err);
    });    
  }


  /// On Remote Message

  function onRemoteMessage(msg) {
    if (! initialized) throw new Error('Not initialized');
    
    // unpack message
    var meta = msg.meta;
    if (! meta) throw new Error('no msg.meta');
    msg = msg.pl;
    if (! msg) throw new Error('no msg.pl');
    msg._id = meta._id;
    msg._nodes = meta._nodes;

    // validate message meta
    if (! msg._nodes) throw new Error('missing meta _nodes in remote message');
    if (! msg._id) throw new Error('missing meta _id in remote message');

    // only use message if it has not passed this node yet
    if (msg._nodes.indexOf(nodeId) == -1) {
      msg._nodes.push(nodeId);
      e.emit('message', msg);
    }
  }

  /// Send Message

  function message(msg, done) {
    remoteEmitter.emit('message', msg);
    if (done) done();
  };

  e.message =
  function enqueueMessage(msg) {
    if (ended) return;
    if (typeof msg != 'object') throw new Error('a message must be an object. ' + (typeof msg) + ' is not acceptable.');
    if (! msg._id) msg._id = uuid.v4();
    if (! msg._nodes) msg._nodes = [];
    if (msg._nodes.indexOf(peerId) > -1) return;

    msg = {
      pl: msg,
      meta: {
        _nodes: msg._nodes,
        _id: msg._id
      }
    };

    delete msg.pl._id;
    delete msg.pl._nodes;

    enqueue(message, msg);
    process.nextTick(flush);
    return false;
  };


  /// Acknowledge

  e.acknowledge =
  function acknowledge(id) {
    remoteEmitter.emit('ack', id);
  };


  /// On Remote Acknowledge

  function onRemoteAcknowledge(id) {
    e.emit('acknowledge', id);
  }


  /// End
  e.end =
  function end() {
    if (ended) return;
    if (timeout) clearTimeout(timeout);
    remoteStream.end();
    remoteStream.emit('end');
  };


  /// Listeners

  remoteEmitter.on('message', onRemoteMessage);
  remoteEmitter.on('ack', onRemoteAcknowledge);

  remoteStream.once('end', function() {
    if (ended) return;
    ended = true;
    remoteEmitter.removeListener('message', onRemoteMessage);
    remoteEmitter.removeListener('ack', onRemoteAcknowledge);
    e.emit('end');
  });


  return e;
};