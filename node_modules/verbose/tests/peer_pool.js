var test = require('tap').test;
var PeerPool = require('../peer_pool');
var helpers = require('./helpers');


test('add wires up spine stream', function(t) {
  t.plan(2);

  var s = helpers.mockStream();
  var peers = PeerPool(s);
  var peer = helpers.mockStream();
  peers.add(peer);

  peer.on('write', function(d) {
    t.deepEqual(d, ['ABC']);
    peer.emit('data', 'DEF')
  });

  s.on('write', function(d) {
    t.deepEqual(d, ['DEF']);
    peers.end();
  });

  s.emit('data', 'ABC');
});


test('add connects to other peer', function(t) {
  t.plan(1);

  var s = helpers.mockStream();
  var peers = PeerPool(s);
  var peer1 = helpers.mockStream();
  peers.add(peer1);
  var peer2 = helpers.mockStream();
  peers.add(peer2);

  peer2.on('write', function(d) {
    t.deepEqual(d, ['ABCDEF']);
    peers.end();
  });

  peer1.emit('data', 'ABCDEF');

});

test('when a peer ends it does not emit more data', function(t) {
  var s = helpers.mockStream();
  var peers = PeerPool(s);
  var peer = helpers.mockStream();
  peers.add(peer);

  peer.on('write', helpers.shouldNot('write on ended peer'));

  peer.emit('end');

  s.emit('data', 'ABCDEF');

  t.end();

  peers.end();
});

test('peer is removed after end timeout', function(t) {
  t.plan(2);

  var opts = helpers.options({bufferTimeout: 10});
  var s = helpers.mockStream();
  var peers = PeerPool(s, opts);
  var peer = helpers.mockStream();
  peers.add(peer);

  t.deepEqual(peers.list().length, 1);
  peer.emit('end');

  setTimeout(function() {
    t.deepEqual(peers.list().length, 0);
    peers.end();
  }, 20);

});

test('peer is not removed after end timeout if it gets replaced', function(t) {
  t.plan(2);

  var opts = helpers.options({bufferTimeout: 10});
  var s = helpers.mockStream();
  var peers = PeerPool(s, opts);
  var peer1 = helpers.mockStream();
  peer1.pendingMessages = function() {};

  peers.add(peer1);

  t.deepEqual(peers.list().length, 1);
  peer1.emit('end');

  setTimeout(function() {
    var peer2 = helpers.mockStream();
    peer2.takeMessages = function() {};
    peers.add(peer2);
  }, 5);

  setTimeout(function() {
    t.deepEqual(peers.list().length, 1);
    peers.end();
  }, 20);

});