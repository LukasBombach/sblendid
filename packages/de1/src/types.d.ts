// type PUUID = string;
// type SUUID = BluetoothServiceUUID;
// type CUUID = BluetoothCharacteristicUUID;
// type DUUID = BluetoothDescriptorUUID;

// type Promish<T> = Promise<T> | T;
// type Encoder<T> = (value: T) => Promish<Buffer>;
// type Decoder<T> = (value: Buffer) => Promish<T>;

type Prop = string;
type PropListener<P> = (value: any) => void;

interface Converter<T> {
  uuid: CUUID;
  name?: string;
  encode?: Encoder<T>;
  decode?: Decoder<T>;
}

interface StateParseResult {
  state: number;
  substate: number;
}

declare enum State {
  sleep,
  goingToSleep,
  idle,
  busy,
  espresso,
  steam,
  hotWater,
  shortCal,
  selfTest,
  longCal,
  descale,
  fatalError,
  init,
  noRequest,
  skipToNext,
  hotWaterRinse,
  steamRinse,
  refill,
  clean,
  inBootLoader,
  airPurge
}

type States = { [S in keyof typeof State]: number };
