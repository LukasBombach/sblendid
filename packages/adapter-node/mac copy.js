const { EventEmitter } = require("events");
const util = require("util");
const NobleMac = require("./native/noble_mac").NobleMac;

class FakeEmitter extends EventEmitter {
    emit(...args) {
        console.log("event;", ...args);
        super.emit(...args);
    }
}

function inspect(thing) {
    return util.inspect(thing, { depth: 10, colors: true });
}

const callback = (...args) => console.log("callback", ...args);

util.inherits(NobleMac, FakeEmitter);

const nobleMac = new NobleMac();

console.log("init");
nobleMac.init();

nobleMac.on("stateChange", (...args) => {
    console.log("stateChange", args);
});

console.log(nobleMac.eventNames());
console.log(nobleMac.getMaxListeners());

// nobleMac.removeAllListeners();

console.log("done");