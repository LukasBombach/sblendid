import Parser from "../parser";
import Serializer from "../serializer";

const converter: Converter<State> = {
  name: "state",
  uuid: "a003",
  encode,
  decode
};

const states: States = {
  sleep: 0x00,
  goingToSleep: 0x01,
  idle: 0x02,
  busy: 0x03,
  espresso: 0x04,
  steam: 0x05,
  hotWater: 0x06,
  shortCal: 0x07,
  selfTest: 0x08,
  longCal: 0x09,
  descale: 0x0a,
  fatalError: 0x0b,
  init: 0x0c,
  noRequest: 0x0d,
  skipToNext: 0x0e,
  hotWaterRinse: 0x0f,
  steamRinse: 0x10,
  refill: 0x11,
  clean: 0x12,
  inBootLoader: 0x13,
  airPurge: 0x14
};

function decode(data: Buffer): State {
  const { state: value } = parse(data);
  const state = getNameFromValue(value);
  if (!state) throw new Error(`Received unexpected state ${value}`);
  return state;
}

function encode(state: State): Buffer {
  const stateValue = states[state];
  if (!stateValue) throw new Error(`Unknown state "${state}"`);
  return serialize(state);
}

function parse(data: Buffer): StateParseResult {
  return new Parser<StateParseResult>(data)
    .char("state")
    .char("substate")
    .vars();
}

function serialize(state: State): Buffer {
  return new Serializer()
    .char(states[state])
    .char(0x00)
    .buffer();
}

function getNameFromValue(state: number): State | undefined {
  for (const k in states) if (states[k] === state) return k as any;
}

export default converter;
