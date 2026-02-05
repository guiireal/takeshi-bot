var test = require('tap').test;
var Node = require('..');
var helpers = require('./helpers');

var options = {
  timeout: 5e3
};

test('emits from client to server', function(t) {

  t.plan(3);

  var s = Node(helpers.clone(options));
  var c = Node(helpers.clone(options));
  var port = helpers.randomPort();

  s.listen(port);
  c.connect(port);

  s.on('abc', function(_a, _b, _c) {
    t.equal(_a, 'a');
    t.equal(_b, 'b');
    t.type(_c, 'undefined');
    c.end();
    s.end();
  });

  c.emit('abc', 'a', 'b');

});

test('emits from server to client', function(t) {

  t.plan(3);

  var s = Node(helpers.clone(options));
  var c = Node(helpers.clone(options));
  var port = helpers.randomPort();

  s.listen(port);
  c.connect(port);

  c.on('abc', function(_a, _b, _c) {
    t.equal(_a, 'hey1');
    t.equal(_b, 'hey2');
    t.type(_c, 'undefined');
    c.end();
    s.end();
  });

  c.stream.once('initialized', function() {
    s.emit('abc', 'hey1', 'hey2');
  });

});