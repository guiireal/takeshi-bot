# reconnect

Reconnect a stream (tcp, ws, tls, http) when network goes down.

## Status: LEGACY, use [reconnect-core](https://github.com/juliangruber/reconnect-core)

This module should now be considered legacy,
it is recommend to use reconnect-core directly.
This module is now only a bundle of wrappers around reconnect-core.

Currently supports:
* [tcp](http://nodejs.org/api/net.html)
* [shoe](https://github.com/substack/shoe) (websocket fallback - on the client-side)
* [tls](http://nodejs.org/api/tls.html)
* [sockjs-stream](https://github.com/Raynos/sockjs-stream) (server side websockets)
* [engine.io-stream](https://github.com/Raynos/engine.io-stream)

## Example

Pass a function that will be called every time the stream connects.
if the connection is broken, reconnect will make a new connection
and call this function again.
``` js
var reconnect = require('reconnect')

reconnect(function (stream) {
  //called every time the connection is remade.
  //only one connection will ever be live at one time.
}).connect(port)
```

## WebSockets

websockets can be used from both the client and the server, with the same code!

``` js
var reconnect = require('reconnect/shoe')

reconnect(function (stream) {
  //called every time the connection is remade.
  //only one connection will ever be live at one time.
}).connect('http://localhost:8080/ws')
```

a [shoe](http://npm.im/shoe) server must be used.

## API

### reconnect (opts, onConnect)

if `opts` is an object it will be passed to [backoff](https://github.com/MathieuTurcotte/node-backoff)
which handles throttling the reconnection attempts. it also accepts a `type` parameter, which may
be either `'fibonacci'` or `'exponential'`.

``` js
//example opts
var opts = {
  randomisationFactor: 0,
  initialDelay: 10,
  maxDelay: 300
}
```

`opts` is optional. If `opts.immediate` is `true` then we will treat the
stream as if it does not emit a `"connect"` event and fall back to listening
to the first piece of data. This is useful for non connection streams like
database cursors or tailing files.

passing `onConnect` to reconnect is short hand for `reconnect(opts).on('connect', onConnect)`

### reconnect.connect (...)

attempt to connect. the arguments will be passed onto the underlying stream type.
(either you are calling `shoe(uri)` or `net.connect(port)`)
these arguments will be used for every subsequent connection attempt.

### emit('connect', stream)

emitted when a new connection is made (that includes after a disconnection!)

### emit('disconnect', stream)

emitted when the stream has disconnected.

### emit ('backoff', attempts, delay)

reemitted from [backoff](https://github.com/MathieuTurcotte/node-backoff)
when reconnect is waiting for the next time to connect.

### emit ('reconnect', attempts, delay)

emitted when attempting a new connection.

### reconnector.reconnect

set to `false` and `reconnect` will not automatically reconnect.
starts out true.

## Extending

Use [reconnect-core](https://github.com/juliangruber/reconnect-core) instead.

## Widget

The reconnect widget has been moved into a separate module
[reconnect-widget](https://github.com/dominictarr/reconnect-widget)

## License

MIT
