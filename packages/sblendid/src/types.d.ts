type PUUID = string;
type SUUID = BluetoothServiceUUID;
type CUUID = BluetoothCharacteristicUUID;
type DUUID = BluetoothDescriptorUUID;

type NamedCUUID = CUUID | string;

interface Converter<T> {
  uuid: CUUID;
  name?: string;
  encode?: Encoder<T>;
  decode?: Decoder<T>;
}

interface CConvertish<T> {
  encode?: Encoder<T>;
  decode?: Decoder<T>;
}

type ConverterMap<T> = Record<string, Converter<T>[]>;

type PeripheralState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected";

type Promish<T> = Promise<T> | T;
type Resolve = (value?: unknown) => void;
type Reject = (reason?: any) => void;

type Listener<T> = (value: T) => Promish<void>;
type Encoder<T> = (value: T) => Promish<Buffer>;
type Decoder<T> = (value: Buffer) => Promish<T>;

interface Properties {
  read: boolean;
  write: boolean;
  notify: boolean;
}

type Item = () => Promish<any>;
type ItemReturn<T> = T extends "function" ? ReturnType<Item> : Promise<T>;
type ItemFunction<T> = (...args: any[]) => Promise<ItemReturn<T>>;
