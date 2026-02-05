var inject = require('..')
var test = require('tape')
var Stream = require('stream')
var Emitter = require('events').EventEmitter
var noop = function () {}

var ee = new Emitter

var reconnect = inject(function () {
  var s = new Stream
  process.nextTick(function () {
    s.emit('connect')
    s.emit('close')
  })
  s.end = noop
  return s
})

test('on connect listener', function (t) {
  t.plan(1)

  reconnect().on('connect', function () {
    t.ok(true)
    this.reconnect = false
  }).connect()
})
