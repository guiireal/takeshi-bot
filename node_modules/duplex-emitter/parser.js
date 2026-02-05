var combine = require('stream-combiner');
var split = require('split');
var through = require('through');

module.exports =
function createParser() {
  var JSONParse = through(parseJSON);
  var s = combine(split('\n'), JSONParse);
  return s;

  function parseJSON(d) {
    if (d) {
      try {
        d = JSON.parse(d)
      } catch(err) {
        s.emit('error', err);
        return;
      }
      this.queue(d);
    }
  }
};

