import { EventEmitter } from "events";
import Adapter, {
  Params,
  Advertisement,
  CharacteristicData
} from "@sblendid/adapter-node";

type Listener = (...args: any[]) => void;

const emitter = new EventEmitter();
setInterval(() => emitter.emit("discover", ...discoverParams), 10);

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
export const suuids = ["suuid-1", "suuid-2", "suuid-3"];
export const rssi = 1;
export const characteristicDatas: CharacteristicData[] = [
  { uuid: "cuuid-1", properties: { read: true, write: false, notify: false } },
  { uuid: "cuuid-2", properties: { read: false, write: true, notify: false } },
  { uuid: "cuuid-3", properties: { read: false, write: false, notify: true } }
];
export const readBuffer = Buffer.from("read", "utf8");
export const notify = true;

export class AdapterMock {}
Object.assign(AdapterMock.prototype, {
  powerOn: jest
    .fn()
    .mockReturnValue(new Promise<void>(res => setTimeout(res, 0))),
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
  on: jest.fn((e: string, listener: Listener) => emitter.on(e, listener)),
  off: jest.fn((e: string, listener: Listener) => emitter.off(e, listener)),
  getCharacteristics: jest.fn().mockResolvedValue(characteristicDatas),
  read: jest.fn().mockResolvedValue(readBuffer),
  write: jest.fn().mockResolvedValue(undefined),
  notify: jest.fn().mockResolvedValue(notify)
});

export default isMock ? Adapter : AdapterMock;
