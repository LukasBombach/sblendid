import Adapter, { Params, Advertisement } from "@sblendid/adapter-node";

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

Object.assign(AdapterMock.prototype, {
  powerOn: jest.fn().mockResolvedValue(undefined),
  startScanning: jest.fn(),
  stopScanning: jest.fn(),
  find: jest.fn().mockResolvedValue(discoverParams),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn(),
  getRssi: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  getCharacteristics: jest.fn(),
  read: jest.fn(),
  write: jest.fn(),
  notify: jest.fn()
});

// powerOn(): Promise<void>;
// startScanning(): void;
// stopScanning(): void;
// find(condition: FindCondition): Promise<Params<"discover">>;
// connect(pUUID: PUUID): Promise<void>;
// disconnect(pUUID: PUUID): Promise<void>;
// getServices(pUUID: PUUID): Promise<SUUID[]>;
// getRssi(pUUID: PUUID): Promise<number>;
// on<E extends Event>(event: E, listener: Listener<E>): void;
// off<E extends Event>(event: E, listener: Listener<E>): void;
// getCharacteristics(pUUID: PUUID, sUUID: SUUID): Promise<CharacteristicData[]>;
// read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer>;
// write(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID, value: Buffer, withoutResponse?: boolean): Promise<void>;
// notify(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID, notify: boolean): Promise<boolean>;

export default isMock ? Adapter : AdapterMock;
