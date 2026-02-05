var EngineIO = require("engine.io")
var EventEmitter = require("events").EventEmitter

var EngineStream = require("./eiostream")

module.exports = EngineServer

function EngineServer(onConnection) {
    var engine = new EventEmitter
    var servers = []

    engine.attach = attach
    engine.close = close

    if (onConnection) {
        engine.on("connection", onConnection)
    }

    function attach(httpServer, options) {
        options = options || {}

        if (typeof options === "string") {
            options = { path: options }
        }

        var server = EngineIO.attach(httpServer, options)

        servers.push(server)

        server.on("error", engine.emit.bind(engine, "error"));

        server.on("connection", function (socket) {
            engine.emit("connection", EngineStream(socket))
        })
        return server
    }

    function close() {
        servers.forEach(invoke("close"))
    }

    return engine
}

function invoke(method) {
    return function (obj) {
        return (obj[method])()
    }
}
