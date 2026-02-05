var test = require('tap').test;
var PeerProtocol = require('../peer_protocol');
var Stream = require('stream');
var DuplexEmitter = require('duplex-emitter');
var helpers = require('./helpers');

var options = {
  node_id: 'NODE_ID_1',
  channel: 'CHANNEL_1',
  log:     function() {},
  timeout: 100,
  acknowledgeInterval: 100
};


test('initializes', function(t) {
  t.plan(6);

  var streams = helpers.mockStreamPair();
  var remoteStream = streams[0];
  var localStream = streams[1];

  var remoteEmitter = DuplexEmitter(remoteStream);

  var p = PeerProtocol(localStream, options);

  p.on('peerid', function(peerId) {
    t.equal(peerId, 'REMOTE_PEER_ID');
  });

  p.on('initialized', function(lastMessageId, isReconnect) {
    t.equal(lastMessageId, 'ABC');
    t.equal(isReconnect, 'DEF');
  });

  remoteEmitter.on('peerid', function(channelId, peerId) {
    t.equal(channelId, 'CHANNEL_1');
    t.equal(peerId, 'NODE_ID_1');
    remoteEmitter.emit('peerid', 'CHANNEL_1', 'REMOTE_PEER_ID');
  });

  remoteEmitter.on('sync', function() {
    t.ok(true, 'sync received on peer');
    remoteEmitter.emit('sync', 'ABC', 'DEF');
  });

  p.initialize();

});

test('times out when peer is unresponsive', function(t) {
  t.plan(1);

  var streams = helpers.mockStreamPair();
  var remoteStream = streams[0];
  var localStream = streams[1];

  var remoteEmitter = DuplexEmitter(remoteStream);

  var p = PeerProtocol(localStream, options);

  p.initialize();

  p.on('error', function(err) {
    t.ok(err.message.match(/timeout/), 'errors with timeout');
  });

});

test('emits messages', function(t) {
  t.plan(1);

  var streams = helpers.mockStreamPair();
  var remoteStream = streams[0];
  var localStream = streams[1];
  var remotePeer = helpers.remotePeer('REMOTE_NODE_ID', options, remoteStream);
  var p = PeerProtocol(localStream, options);
  p.initialize();
  p.message({a: 'ABC'});
  p.message({a: 'DEF'});

  var collected = [];
  remotePeer.on('message', function(m) {
    collected.push(m);
    if (collected.length >= 2) {
      t.similar(collected, [{pl: {a: 'ABC'}}, {pl: {a: 'DEF'}}]);
      p.end();
    }
  });

});