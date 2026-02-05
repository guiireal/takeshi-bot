var EventEmitter = require('events').EventEmitter;
var Options = require('./options');

exports =
module.exports = 
function PeerPool(spine, opts) {


  var options = Options(opts);
  var ee = new EventEmitter();
  var ending = false;
  var ended = false;

  var peers = [];
  var byPeerId = {};
  var timeouts = {};

  function remove(peer) {
    var idx = peers.indexOf(peer);
    if (idx > -1) peers.splice(idx, 1);
  }

  function wireup(peer) {

    peer.setMaxListeners(options.maxPeers * 2);

    var peerId;

    /// Pipe all messages emitted by spine into this peer
    spine.pipe(peer, {end: false});

    /// Pipe all messages emitted by this peer into the spine
    peer.pipe(spine, {end: false});

    peers.forEach(function(otherPeer) {
      if (peer != otherPeer) {
        peer.
          pipe(otherPeer, {end: false});
        otherPeer.
          pipe(peer, {end: false});
      }
    });

    peer.once('end', function() {
      remove(peer);
      if (peerId && !timeouts[peerId]) {
        timeouts[peerId] = setTimeout(function() {
          delete byPeerId[peerId];
        }, options.timeout);
      }
    });

    peer.once('peerid', function(id) {
      peer.peerId = id;
      var existingPeer = byPeerId[id];
      if (existingPeer) {
        
        peer.lastMessageId = existingPeer.lastMessageId;
        peer.isReconnect = true;
        peer.takeMessages(existingPeer.pendingMessages());
        existingPeer.end();
        
        var timeout = timeouts[id];
        if (timeout) {
          clearTimeout(timeout)
          delete timeouts[id];
        }
      }
      byPeerId[id] = peer;
      peerId = id;
    });
  }

  ee.add =
  function add(peer) {
    if (ended) throw new Error('Ended');
    wireup(peer);
    peers.push(peer);
  };

  ee.list =
  function list() {
    return peers;
  };

  ee.end =
  function end() {
    ending = true;
    ee.emit('ending');
    peers.forEach(function(peer) {
      peer.end();
    });

    Object.keys(timeouts).forEach(function(id) {
      clearTimeout(timeouts[id]);
      delete timeouts[id];
    });
  }

  return ee;
};