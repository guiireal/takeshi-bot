# invert-stream

Create a pair of streams (A, B) such that `A.write(X) -> B.emit('data', X)`
and `B.write(X) -> A.emit('data', X)`

``` js

var invert = require('invert-stream')

var inverted = invert()

in_steam.pipe(inverted.other).pipe(out_stream)

inverted.write(data_for_outstream)
inverted.on('data', data_from_in_stream)

## why ?

this is useful for a couple of things.

  * testing streams based stuff
  * making flexible duplex stream apis

an `invert-stream` pair is like a tcp connection, 
but in-process and synchronous. It's way easier to test
edge cases related to event order if you stuff works sync.

Also, it's useful making duplex streams, or multiple streams into one.

### Example

```js

  var spawn = require('child_process').spawn
  var invert = require('invert-stream')

  var ch = spawn(cmd, args)
  var inverted = invert()

  ch.stdout.pipe(inverted.other).pipe(ch.sdin)

  //now, we have just ONE stream: inverted

  //write to che ch's stdin
  inverted.write(data)

  //read from ch's stdout
  inverted.on('data', ...) 

```

## License

MIT
