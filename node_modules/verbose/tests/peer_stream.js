var test = require('tap').test;
var PeerStream = require('../peer_stream');
var MockServer = require('./mock_server');
var helpers = require('./helpers');
var async = require('async');
var es = require('event-stream');
var fs = require('fs');

var options = {
  node_id: 'NODE_ID_1',
  channel: 'CHANNEL_1',
  log:     function() {},
  timeout: 1000,
  acknowledgeInterval: 100
};


test('handshakes', function(t) {
  t.plan(1);
  
  var port = helpers.randomPort();
  var server = MockServer(options);
  var recon = helpers.connect(port, options, function(s) {
    s.once('initialized', function() {
      t.ok(true, 'initialized');
      s.end();
      server.close();
    });
  });
  server.listen(port);
});

test('errors on wrong channel', function(t) {
  t.plan(2);
  
  var serverOptions = helpers.clone(options);
  serverOptions.channel = 'WRONG_CHANNEL';
  var server = MockServer(serverOptions);

  var port = helpers.randomPort();
  var recon = helpers.connect(port, options, function(s) {
    s.once('error', function(err) {
      t.ok(err);
      t.equal(err.message, 'wrong channel name: WRONG_CHANNEL. Expected CHANNEL_1');
      s.end();
      server.close();    
    });
  });  

  server.listen(port);
});

test('sends message', function(t) {
  t.plan(1);
  
  var server = MockServer(options);
  var port = helpers.randomPort();
  var recon = helpers.connect(port, options, function(s) {
    server.on('message', function(m) {
      t.similar(m, {pl: {a: 'this is a message'}});
      s.end();
      server.close();        
    });

    s.write({a: 'this is a message'});
  });

  server.listen(port);
});


test('can pipe to', function(t) {
  t.plan(1);
  var server = MockServer(options);

  var port = helpers.randomPort();
  var recon = helpers.connect(port, options, function(s) {

    var collected = [];
    server.on('message', function(m) {
      collected.push(m);
      if (collected.length >= 3) {
        t.similar(collected, [
          {pl: {a: 'event one'}},
          {pl: {a: 'event two'}},
          {pl: {a: 'event three'}} ]);

        s.end();
        server.close();        
      }
    });

    var source = es.pipeline(
      fs.createReadStream(__dirname + '/events.txt'),
      es.split(),
      es.parse()
    )
    source.pipe(s);

  });

  server.listen(port);

});


test('can pipe from', function(t) {

  t.plan(1);

  var server = MockServer(options);

  server.send = [
    {pl: {a: 'event uno'}, meta: { _id: 'id1', _nodes: []}},
    {pl: {a: 'event due'}, meta: { _id: 'id2', _nodes: []}},
    {pl: {a: 'event trei'}, meta: { _id: 'id2', _nodes: []}}];

  var port = helpers.randomPort();
  var recon = helpers.connect(port, options, function(s) {
    var collected = [];
    var dest = es.mapSync(function(d) {
      collected.push(d);
      if (collected.length >= 3) {
        t.similar(collected, [{a: 'event uno'}, {a: 'event due'}, {a: 'event trei'}]);
        s.end();
        server.close();        
      }
    });

    s.pipe(dest);

  });

  server.listen(port);

});

test('when acknowledge comes, removes message from buffer', function(t) {

  t.plan(2);

  var server = MockServer(options);

  var port = helpers.randomPort();
  var recon = helpers.connect(port, options, function(s) {
    var collected = [];
    server.on('ack', function(id) {
      if (! id) return;
      collected.push(id);
      if (collected.length >= 2) {
        t.ok(collected.indexOf('def') >= 0, 'server got acknowledge for last msg');
        t.equal(s.bufferLength(), 0);
        s.end();
        server.close();        
      }
    });

  });

  server.send = [
    [{pl: {a: 'message 1'}, meta: {_id: 'abc', _nodes: ['a']}}],
    [{pl: {a: 'message 2'}, meta: {_id: 'def', _nodes: ['a']}}]
  ];
  server.listen(port);
});

test('emits acknowledges', function(t) {
  
  t.plan(2);

  var server = MockServer(options);

  var port = helpers.randomPort();
  var recon = helpers.connect(port, options, function(s) {
    var lastId;
    var mCount = 0;
    server.on('message', function(m) {
      lastId = m.meta._id;
      t.ok(!! lastId, 'message has id');
      mCount ++;
      if (mCount >= 2) {
        var acknowledges = 0;
        s.on('acknowledge', function(id) {
          if (id == lastId) {
            t.ok(true, 'ended');
            s.end();
            server.close();
          }
        });        
      }
    });

    s.write({a: 'abc'});
    s.write({a: 'def'});
  });

  server.listen(port);

});

test('buffering messages time out', function(t) {
  t.plan(2);
  
  var opts = helpers.clone(options);
  opts.bufferTimeout = 10;
  
  var server = MockServer(opts);
  server.acknowledge = false;
  var port = helpers.randomPort();
  var recon = helpers.connect(port, opts, function(s) {
    // safeguard to ensure the server is not acknowledging
    s.on('acknowledge', helpers.shouldNot('should not acknowledge'));

    s.write({a: 'abc'});
    s.write({a: 'def'});

    t.equal(s.bufferLength(), 2);

    setTimeout(function() {
      t.equal(s.bufferLength(), 0);
      s.end();
      server.close();
    }, 500);

  });


  server.listen(port)
});

test('synchronizes missing messages', function(t) {

  t.plan(3);
  
  var server = MockServer(options);
  server.acknowledge = false;
  var port = helpers.randomPort();
  
  var connCount = -1;
  var connections = [];
  var recon;
  
  connections.push(function(s) {
    var collected = [];
    var firstId;
    function onMessage(m) {
      if (! firstId) firstId = m.meta._id;
      collected.push(m.pl);
      if (collected.length >= 3) {
        server.removeListener('message', onMessage);
        t.similar(collected, [{a: 'ghi'}, {a: 'jkl'}, {a: 'mno'}]);
        t.ok(!! firstId);
        recon.reconnect = true;

        server.once('close', function() {
          server.sync = firstId;
          server.listen(port);
        });

        server.forceClose();
      }
    }
    server.on('message', onMessage);

    s.write({a: 'ghi'});
    s.write({a: 'jkl'});
    s.write({a: 'mno'});
  });
  
  connections.push(function(s) {

    var collected = [];
    server.on('message', function(m, meta) {
      collected.push(m.pl);
      if (collected.length >= 2) {
        t.similar(collected, [{a:'jkl'}, {a:'mno'}]);
        recon.reconnect = false;
        s.end();
        server.close();
      }
    });
  });
  
  var messages;
  recon = helpers.connect(port, options, function(s) {
    if (! messages) messages = s.pendingMessages();
    else s.takeMessages(messages);

    connCount ++;
    connections[connCount](s);
  });

  server.listen(port);

});

test('emits the end event once when ends', function(t) {
  t.plan(1);

  var server = MockServer(options);
  var port = helpers.randomPort();
  recon = helpers.connect(port, options, function(s) {
    s.once('initialized', function() {
      s.once('end', function() {
        t.ok(true, 'ended');
        s.on('end', helpers.shouldNot('emit end event more than once'));
        server.close();
      });
      s.end();
    });

  });

  server.listen(port);

});

// test('spits out stream stats')

// test('be killable')