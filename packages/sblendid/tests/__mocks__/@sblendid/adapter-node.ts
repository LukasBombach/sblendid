import Adapter, {
  Params,
  Advertisement,
  CharacteristicData
} from "@sblendid/adapter-node";

export const isMock = Boolean(process.env.USE_BLE);
export class AdapterMock {}
export const advertisement: Advertisement = {};
export const discoverParams: Params<"discover"> = [
  "peripheralUuid",
  "address",
  "public",
  true,
  advertisement,
  1
];
export const suuids = ["suuid-1", "suuid-2", "suuid-3"];
export const rssi = 1;
export const characteristicDatas: CharacteristicData[] = [
  { uuid: "cuuid-1", properties: { read: true, write: false, notify: false } },
  { uuid: "cuuid-2", properties: { read: false, write: true, notify: false } },
  { uuid: "cuuid-3", properties: { read: false, write: false, notify: true } }
];
export const readBuffer = Buffer.from("read", "utf8");
export const notify = true;

Object.assign(AdapterMock.prototype, {
  powerOn: jest.fn().mockResolvedValue(undefined), // powerOn(): Promise<void>;
  startScanning: jest.fn(), // startScanning(): void;
  stopScanning: jest.fn(), // stopScanning(): void;
  find: jest.fn().mockResolvedValue(discoverParams), // find(condition: FindCondition): Promise<Params<"discover">>;
  connect: jest.fn().mockResolvedValue(undefined), // connect(pUUID: PUUID): Promise<void>;
  disconnect: jest.fn().mockResolvedValue(undefined), // disconnect(pUUID: PUUID): Promise<void>;
  getServices: jest.fn().mockResolvedValue(suuids), // getServices(pUUID: PUUID): Promise<SUUID[]>;
  getRssi: jest.fn().mockResolvedValue(rssi), // getRssi(pUUID: PUUID): Promise<number>;
  on: jest.fn(), // on<E extends Event>(event: E, listener: Listener<E>): void;
  off: jest.fn(), // off<E extends Event>(event: E, listener: Listener<E>): void;
  getCharacteristics: jest.fn().mockResolvedValue(characteristicDatas), // getCharacteristics(pUUID: PUUID, sUUID: SUUID): Promise<CharacteristicData[]>;
  read: jest.fn().mockResolvedValue(readBuffer), // read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer>;
  write: jest.fn().mockResolvedValue(undefined), // write(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID, value: Buffer, withoutResponse?: boolean): Promise<void>;
  notify: jest.fn().mockResolvedValue(notify) // notify(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID, notify: boolean): Promise<boolean>;
});

export default isMock ? Adapter : AdapterMock;
