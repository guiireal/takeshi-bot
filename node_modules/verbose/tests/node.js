var test = require('tap').test;
var async = require('async');
var Node = require('..');
var helpers = require('./helpers');

var options = {
  channel: 'CHANNEL_1',
  timeout: 5e3
};


test('server emits', function(t) {
  t.plan(1);
  var s = Node(helpers.clone(options));
  var c = Node(helpers.clone(options));
  var port = helpers.randomPort();

  c.connect(port);
  s.listen(port);

  c.emit('event 1', 'a', 'b');
  c.emit('event 2', 'c', 'd');
  
  var collected = []; // collect data from server here

  s.stream.on('data', function(d) {
    collected.push(d);
    if (collected.length >= 2) {
      t.similar(collected, [{0:"event 1", 1: 'a', 2: 'b'}, {0:"event 2", 1: 'c', 2: 'd'}]);
      s.end();
      c.end();
    }
  });

});

test('client emits', function(t) {
  t.plan(1);
  var s = Node(helpers.clone(options));
  var c = Node(helpers.clone(options));
  var port = helpers.randomPort();
  c.connect(port);

  c.stream.on('initialized', function() {
    s.emit('message 2.1');
    s.emit('message 2.2');
  });
  s.listen(port);

  var collected = [];
  c.stream.on('data', function(d) {
    collected.push(d);
    if (collected.length >= 2) {
      t.similar(collected, [{0:'message 2.1'}, {0: 'message 2.2'}]);
      c.end();
      s.end();
    }
  });

});

test('several clients connected to server', function(t) {

  t.plan(4);
  var s = Node(helpers.clone(options));
  var c1 = Node(helpers.clone(options));
  var c2 = Node(helpers.clone(options));
  var port = helpers.randomPort();

  initCount = 0;
  function initialized() {
    initCount ++;
    if (initCount >= 2) {
      c1.emit('abc');
      c2.emit('def');
      c1.emit('ghi');
      c2.emit('jkl');      
    }
  }

  c1.stream.once('initialized', initialized);
  c2.stream.once('initialized', initialized);

  var collected = [];
  s.stream.on('data', function(d) {
    collected.push(JSON.stringify(d));
    if (collected.length >= 4) {
      t.ok(collected.indexOf('["abc"]') >= 0, 'got message 1');
      t.ok(collected.indexOf('["def"]') >= 0, 'got message 2');
      t.ok(collected.indexOf('["ghi"]') >= 0, 'got message 3');
      t.ok(collected.indexOf('["jkl"]') >= 0, 'got message 4');
      c1.end();
      c2.end();
      s.end();
    }
  });

  c1.connect(port);
  c2.connect(port);
  s.listen(port);
});


test('server peer resends missed events', function(t) {
  t.plan(4);
  var port = helpers.randomPort();
  var c = Node(helpers.clone(options));
  var s = Node(helpers.clone(options));
  s.listen(port);

  var reconnected = false;
  var collected = [];
  c.stream.on('data', function(d) {
    t.ok(reconnected, 'already reconnected');
    collected.push(JSON.stringify(d));
    if (collected.length >= 3) {
      t.deepEqual(collected, ['["abc"]', '["def"]', '["ghi"]']);
      c.end();
      s.end();
    }
  });

  c.stream.once('initialized', function() {
    s.emit('abc');
    s.emit('def');
    s.emit('ghi');
    c.stream.once('disconnect', function() {
      reconnected = true;
      c.connect(port);
    });
    c.disconnect();
  });

  c.connect(port);

});

test('after disconnected for a long time and a peer gets garbage-collected', function(t) {
  t.plan(1);
  
  var port = helpers.randomPort();
  
  var c = Node(helpers.clone(options));
  
  var serverOptions = helpers.clone(options);
  serverOptions.bufferTimeout = 100;
  var s = Node(serverOptions);
  
  s.listen(port);
  c.connect(port);
  
  c.stream.once('initialized', function() {
    t.equal(s.peers().length, 1, 'server has one peer');
    c.end();
    setTimeout(function() {
      t.equal(s.peers().length, 0, 'server has no peers');
      s.end();
    }, 500);
  });
});

test('client connected to several servers', function(t) {

  t.plan(6);
  
  var s1 = Node(helpers.clone(options));
  var s2 = Node(helpers.clone(options));
  var c1 = Node(helpers.clone(options));
  var port1 = helpers.randomPort();
  var port2 = helpers.randomPort();
  s1.listen(port1);
  s2.listen(port2);
  c1.connect(port1);
  c1.connect(port2);

  c1.emit('abc');
  c1.emit('def');
  c1.emit('ghi');

  var validated = 0;
  function validateCollected(collected) {
    t.ok(collected.indexOf('["abc"]') >= 0, 'got message 1');
    t.ok(collected.indexOf('["def"]') >= 0, 'got message 2');
    t.ok(collected.indexOf('["ghi"]') >= 0, 'got message 3');
    validated ++;
    if (validated >= 2) {
      c1.end();
      s1.end();
      s2.end();
    }
  }

  var collected1 = [];
  s1.stream.on('data', function(d) {
    collected1.push(JSON.stringify(d));
    if (collected1.length >= 3) validateCollected(collected1);
  });

  var collected2 = [];
  s2.stream.on('data', function(d) {
    collected2.push(JSON.stringify(d));
    if (collected2.length >= 3) validateCollected(collected2);
  });

});

test('same emitter does not emit back', function(t) {
  t.plan(3);

  var s = Node(helpers.clone(options));
  var c = Node(helpers.clone(options));
  var port = helpers.randomPort();

  c.connect(port);
  s.listen(port);

  c.on('ABC', helpers.shouldNot('emit back'));

  s.on('ABC', function(a, b, _c) {
    t.equal(a, 'a');
    t.equal(b, 'b');
    t.type(_c, 'undefined');
    c.end();
    s.end();
  });

  c.emit('ABC', 'a', 'b');

});
