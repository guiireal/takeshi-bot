var assert = require('assert');
var after = require('after');

var engine = require('../');

test('simple', function(done) {
    var stream = engine('/invert');

    var cb = after(2, function() {
        stream.end();
    });

    stream.on('data', function(chunk) {
        assert.equal(chunk, 'foobar');
        cb();
    });

    stream.once('close', function() {
        done();
    });
});
