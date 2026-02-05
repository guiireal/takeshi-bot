var http = require('http');

var EngineServer = require('../../server');

var server = http.createServer();
server.listen(process.env.ZUUL_PORT);

var engine = EngineServer(onConnection);
engine.attach(server, '/invert');

function onConnection(stream) {
    var iv = setInterval(function () {
        stream.write('foobar');
    }, 250);

    stream.once('end', function () {
        clearInterval(iv)
    })

    stream.pipe(process.stdout, { end : false })
}
