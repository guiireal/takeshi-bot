var test = require('tap').test;
var net = require('net');

var Options = require('../options');
var BufferedPeer = require('../buffered_peer');
var helpers = require('./helpers');
var MockServer = require('./mock_server')

var options = {
  node_id: 'NODE_ID_1',
  timeout: 1000,
  acknowledgeInterval: 100
};


test('it buffers and connects', function(t) {

  t.plan(1);

  var opts = Options(helpers.clone(options));

  var bp = BufferedPeer(opts);

  bp.write(['ABC']);
  bp.write(['DEF']);

  var port = helpers.randomPort();

  var server = MockServer(helpers.clone(opts));
  var collected = [];
  
  server.on('message', function(d) {
    collected.push(d.pl);
    if (collected.length >= 2) {
      t.deepEqual(collected, [['ABC'], ['DEF']]);
      server.close();
      bp.disconnect();
    }
  });
  
  server.listen(port);

  bp.connect(port);

  bp.on('connect', function() {
    console.log('BP connected');
  })
  bp.on('disconnect', function() {
    console.log('BP DISconnected');
  })
  
});

test('it can start with a connected stream', function(t) {
  t.plan(1);

  var server = net.createServer();
  var port = helpers.randomPort();
  var opts = Options(helpers.clone(options));

  server.on('connection', function(conn) {
    var bps = BufferedPeer(opts, conn);
    bps.write(['abc']);
    bps.write(['def']);

  });

  var bpc = BufferedPeer(Options(helpers.clone(options)));

  var collected = [];
  bpc.on('data', function(d) {
    collected.push(d[0]);
    if (collected.length >= 2) {
      t.similar(collected, ['abc', 'def']);
      server.close();
      bpc.disconnect();
    }

  });

  bpc.connect(port);
  server.listen(port);

});