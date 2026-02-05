var mapping = require("mapping-stream")
    , append = require("insert/append")
    , inject = require("reconnect/inject")

    , engine = require("../../index")

    , body = document.body

var reconnect = inject(function () {
    return engine.apply(null, arguments)
})

reconnect(function (stream) {
    console.log("opening")

    stream.once("connect", function () {
        console.log("connected")
    })

    stream.once("closed", function () {
        console.log("closed", arguments)
    })

    stream.once("end", function () {
        append(body, "ended")
        console.log("ended")
    })
}).connect("/invert")
