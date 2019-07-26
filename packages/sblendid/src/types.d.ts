type PUUID = string;
type SUUID = BluetoothServiceUUID;
type CUUID = BluetoothCharacteristicUUID;
type DUUID = BluetoothDescriptorUUID;

type NamedCUUID = CUUID | string;

interface CConverter<T> {
  uuid: CUUID;
  name?: string;
  encode?: Encoder<T>;
  decode?: Decoder<T>;
}

interface SConverters {
  [uuid: string]: CConverter[];
}

type PeripheralState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected";

type ConverterMap<T> = Record<string, CConverter<T>>;

type Promish<T> = Promise<T> | T;
type Resolve = (value?: unknown) => void;
type Reject = (reason?: any) => void;

type Listener<T> = (value: T) => Promish<void>;
type Encoder<T> = (value: T) => Promish<Buffer>;
type Decoder<T> = (value: Buffer) => Promish<T>;

interface Properties {
  broadcast: boolean;
  read: boolean;
  writeWithoutResponse: boolean;
  write: boolean;
  notify: boolean;
  indicate: boolean;
  authenticatedSignedWrites: boolean;
  reliableWrite: boolean;
  writableAuxiliaries: boolean;
}
