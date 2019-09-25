export const Adapter = jest.requireActual("@sblendid/adapter-node") as any;
export const AdapterMockConstructor = jest.fn(() => adapterMock);

export const adapterMock = {
  powerOn: jest.fn(),
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

export default process.env.USE_BLE ? Adapter : AdapterMockConstructor;
