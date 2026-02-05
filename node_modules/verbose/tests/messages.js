var test = require('tap').test;
var Messages = require('../messages');

test('push and length', function(t) {
  var m = Messages();
  m.push({a: 'message 1', _id: 'id1'});
  m.push({a: 'message 2', _id: 'id2'});
  t.equal(m.length(), 2);
  m.end();
  t.end();
});

test('next', function(t) {
  var m = Messages();
  m.push({a: 'message 1', _id: 'id1'});
  m.push({a: 'message 2', _id: 'id2'});
  t.similar(m.next(), {a: 'message 1', _id: 'id1'});
  t.similar(m.next(), {a: 'message 2', _id: 'id2'});
  t.type(m.next(), 'undefined');
  m.end();
  t.end();
});

test('acknowledge', function(t) {
  var m = Messages();
  m.push({a: 'message 1', _id: 'id1'});
  m.push({a: 'message 2', _id: 'id2'});
  m.push({a: 'message 3', _id: 'id3'});
  m.push({a: 'message 4', _id: 'id4'});
  m.acknowledge('id2');
  t.equal(m.length(), 2);
  t.similar(m.next(), {a: 'message 3', _id: 'id3'});
  m.end();
  t.end();
});

test('buffer timeout', function(t) {
  var m = Messages({timeout: 10});
  m.push({a: 'message 1', _id: 'id1'});
  m.push({a: 'message 2', _id: 'id2'});
  t.equal(m.length(), 2);
  setTimeout(function() {
    t.equal(m.length(), 0);
    m.end();
    t.end();
  }, 20);
});

test('respects max messages', function(t) {
  var m = Messages({maxMessages: 2});
  m.push({a: 'message 1', _id: 'id1'});
  m.push({a: 'message 2', _id: 'id2'});
  m.push({a: 'message 3', _id: 'id3'});
  m.push({a: 'message 4', _id: 'id4'});
  t.equal(m.length(), 2);
  t.similar(m.next(), {a: 'message 3', _id: 'id3'});
  m.end();
  t.end();
});

test('unmatched acknowledge does not consume messages', function(t) {
  var m = Messages({maxMessages: 2});
  m.push({a: 'message 1', _id: 'id1'});
  m.push({a: 'message 2', _id: 'id2'});
  t.equal(m.length(), 2);
  m.acknowledge('id4');
  t.equal(m.length(), 2);
  m.end();
  t.end();
});