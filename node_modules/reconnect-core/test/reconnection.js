var inject = require('..')
var test = require('tape')
var Stream = require('stream')

test('reconnect', function (t) {
  t.plan(18)

  var start = false
  var times = 0
  var reconnect = inject(function () {
    var s = new Stream

    if (start) {
      t.ok(true, 'start server')
      if (++times >= 2) {
        reconnector.reconnect = false
      }
      process.nextTick(function () {
        s.emit('connect')
      });
    }

    process.nextTick(function () {
      s.emit('end')
    })

    return s
  })

  var reconnector = reconnect({initialDelay: 10}, function () {
    t.ok(true, 'reconnect cb fired')
  })
  
  function onConnect () {
    t.ok(reconnector.connected, 'client connected')
  }

  function onReconnect (n) {
    t.ok(true, 'reconnect ' + n)
    t.notOk(reconnector.connected, 'not connected')
    t.ok(reconnector.reconnect, 'will reconnect')
    if (n == 1) start = true;
  }

  reconnector
    .on('connect', onConnect)
    .on('reconnect', onReconnect)
    .connect()
})


