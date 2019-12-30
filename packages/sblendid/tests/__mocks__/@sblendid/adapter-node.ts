import { EventEmitter } from "events";
import Adapter, {
  Params,
  Advertisement,
  CharacteristicData
} from "@sblendid/adapter-node";

type Listener = (...args: any[]) => void;

export const isMock = Boolean(process.env.USE_BLE);
export const advertisement: Advertisement = {
  localName: "Find Me"
};
export const discoverParams: Params<"discover"> = [
  "peripheralUuid",
  "address",
  "public",
  true,
  advertisement,
  1
];
export const suuids = ["180a", "1805"];
export const rssi = 1;
export const characteristicDatas: CharacteristicData[] = [
  { uuid: "2a29", properties: { read: true, write: false, notify: true } },
  { uuid: "2a24", properties: { read: false, write: true, notify: false } }
];
export const readBuffer = Buffer.from("read", "utf8");
export const notify = true;

const bindings = new EventEmitter();

export class AdapterMock {
  private bindings = { bindings };

  constructor() {
    setInterval(() => bindings.emit("discover", ...discoverParams), 10);
  }
}

Object.assign(AdapterMock, {
  powerOn: jest.fn().mockReturnValue(
    new Promise<void>(res => setTimeout(res, 0))
  ),
  powerOff: jest.fn().mockResolvedValue(undefined)
});

Object.assign(AdapterMock.prototype, {
  startScanning: jest.fn(),
  stopScanning: jest.fn(),
  find: jest.fn(async (listener: Listener) => {
    listener(...discoverParams);
    return discoverParams;
  }),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  getServices: jest.fn().mockResolvedValue(suuids),
  getRssi: jest.fn().mockResolvedValue(rssi),
  on: jest.fn((e: string, listener: Listener) => bindings.on(e, listener)),
  off: jest.fn((e: string, listener: Listener) => bindings.off(e, listener)),
  getCharacteristics: jest.fn().mockResolvedValue(characteristicDatas),
  read: jest.fn().mockResolvedValue(readBuffer),
  write: jest.fn().mockResolvedValue(undefined),
  notify: jest.fn((pUUID: PUUID, sUUID: SUUID, cUUID: CUUID, notify: boolean) =>
    Promise.resolve(notify)
  )
});

export default isMock ? Adapter : AdapterMock;
