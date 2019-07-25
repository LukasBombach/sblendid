type PUUID = string;
type SUUID = BluetoothServiceUUID;
type CUUID = BluetoothCharacteristicUUID;
type DUUID = BluetoothDescriptorUUID;

type NamedCUUID = CUUID | string;

interface CharacteristicConverter {
  uuid: BluetoothCharacteristicUUID;
  name?: string;
  encode?: (...args: any[]) => Promise<Buffer> | Buffer;
  decode?: (buffer: Buffer) => Promise<any> | any;
}

interface ServiceConverters {
  [uuid: string]: CharacteristicConverter[];
}

type PeripheralState = "connecting" | "connected" | "disconnecting" | "disconnected";
