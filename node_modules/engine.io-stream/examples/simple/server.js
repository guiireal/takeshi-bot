var http = require("http")
var path = require("path")

var enchilada = require("enchilada");

var ecstatic = require("ecstatic")
var EngineServer = require("../../")

var staticHandler = ecstatic(path.join(__dirname, "static"))
var bundler = enchilada(__dirname + '/static');

var server = http.createServer(function(req, res) {
    req.path = req.url;
    res.contentType = res.setHeader.bind(res, 'content-type');
    res.send = res.end;

    bundler(req, res, function(err) {
        if (err) { return res.end(err.stack) };
        staticHandler(req, res);
    });
})

var engine = EngineServer(function(stream) {
    var iv = setInterval(function () {
        stream.write(String(Math.floor(Math.random() * 2)))
    }, 250)

    stream.once("end", function () {
        clearInterval(iv)
    })

    stream.pipe(process.stdout, { end : false })
})

engine.attach(server, "/invert")

server.listen(8080, function() {
    console.log("Listening on port 8080")
})

