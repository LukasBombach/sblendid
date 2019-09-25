import Sblendid from "../../../src";

export const Adapter = jest.requireActual("@sblendid/adapter-node") as any;
export const AdapterMockConstructor = jest.fn(() => adapterMock);
export const isMock = Boolean(process.env.USE_BLE);

export const adapterMock = {
  powerOn: jest.fn(() => Promise.resolve(new Sblendid())),
  startScanning: jest.fn(),
  stopScanning: jest.fn(),
  find: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  getServices: jest.fn(),
  getRssi: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  getCharacteristics: jest.fn(),
  read: jest.fn(),
  write: jest.fn(),
  notify: jest.fn()
};

export default isMock ? Adapter : AdapterMockConstructor;
