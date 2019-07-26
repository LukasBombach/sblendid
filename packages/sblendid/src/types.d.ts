type PUUID = string;
type SUUID = BluetoothServiceUUID;
type CUUID = BluetoothCharacteristicUUID;
type DUUID = BluetoothDescriptorUUID;

type NamedCUUID = CUUID | string;

interface CConverter {
  uuid: CUUID;
  name?: string;
  encode?: (...args: any[]) => Promise<Buffer> | Buffer;
  decode?: (buffer: Buffer) => Promise<any> | any;
}

interface SConverters {
  [uuid: string]: CConverter[];
}

type PeripheralState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected";
type ConverterMap = Record<string, CConverter>;

type Promish<T> = Promise<T> | T;
type Resolve = (value?: unknown) => void;
type Reject = (reason?: any) => void;
