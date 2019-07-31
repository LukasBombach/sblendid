import Bindings from "../../bindings";

const { EventEmitter } = require("events");
const { inherits } = require("util");
const { NobleMac } = require("./noble_mac");

inherits(NobleMac, EventEmitter);

export default NobleMac as typeof Bindings;
