var inject = require('..')
var Stream = require('stream')
var test = require('tape')

var reconnect = inject(function () {
  var s = new Stream
  process.nextTick(function () {
    s.emit('error', new Error('oh noes!'))
  })
  return s
})

test('attempts', function (t) {
  t.plan(21)

  var fail = function () { t.fail() }
  var reconnector = reconnect({initialDelay: 10}, fail)

  reconnector.on('error', function (err) {
    t.equal(err.message, 'oh noes!', 'correct error message')
  })

  var onReconnect = function (n, delay) {
    t.equal(reconnector.connected, false)
    t.equal(reconnector.reconnect, true)
    if (n > 4) reconnector.reconnect = false
  }

  reconnector
    .on('connect', fail)
    .on('reconnect', onReconnect)
    .connect()
})

