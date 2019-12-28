const util = require("util");
const { EventEmitter } = require("events");
const NobleMac = require("./native/noble_mac").NobleMac;

util.inherits(NobleMac, EventEmitter);

const nobleMac = new NobleMac();

nobleMac.init();

nobleMac.stop();

console.log("done");