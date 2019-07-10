import ExtendedEventEmitter from "./extendedEventEmitter";

type NobleAdapterEvents = {
  stateChange: string;
  addressChange: any;
  scanStart: any;
  scanStop: any;
  discover: any;
  connect: any;
  disconnect: any;
  rssiUpdate: any;
  servicesDiscover: any;
  includedServicesDiscover: any;
  characteristicsDiscover: any;
  read: any;
  write: any;
  broadcast: any;
  notify: any;
  descriptorsDiscover: any;
  valueRead: any;
  valueWrite: any;
  handleRead: any;
  handleWrite: any;
  handleNotify: any;
};

interface NobleAdapter {
  init: () => void;
  startScanning: (
    serviceUuids?: BluetoothServiceUUID[],
    allowDuplicates?: boolean
  ) => void;
  stopScanning: () => void;
  connect: (peripheralUuid: string) => void;
  disconnect: (peripheralUuid: string) => void;
  updateRssi: (peripheralUuid: string) => void;
  discoverServices: (
    peripheralUuid: string,
    serviceUuid?: BluetoothServiceUUID[]
  ) => void;
  discoverIncludedServices: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    serviceUuids: BluetoothServiceUUID[]
  ) => void;
  discoverCharacteristics: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuids: BluetoothCharacteristicUUID[]
  ) => void;
  read: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ) => void;
  write: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    data: Buffer,
    withoutResponse: boolean
  ) => void;
  notify: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    notify: boolean
  ) => void;
  discoverDescriptors: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ) => void;
  readValue: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID
  ) => void;
  writeValue: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID,
    data: Buffer
  ) => void;
  readHandle: (peripheralUuid: string, handle: () => void) => void;
  writeHandle: (
    peripheralUuid: string,
    handle: () => void,
    data: Buffer,
    withoutResponse: boolean
  ) => void;
  stop: () => void;
}

export default class Adapter extends ExtendedEventEmitter {
  public powerOn(timeout?: number) {
    return Promise.all([
      this.when("stateChange", "poweredOn", timeout),
      this.init()
    ]);
  }

  public async init() {}
  public async startScanning() {}
  public async stopScanning() {}
  public async connect() {}
  public async disconnect() {}
  public async updateRssi() {}
  public async discoverServices() {}
  public async discoverIncludedServices() {}
  public async discoverCharacteristics() {}
  public async read() {}
  public async write() {}
  public async notify() {}
  public async discoverDescriptors() {}
  public async readValue() {}
  public async writeValue() {}
  public async readHandle() {}
  public async writeHandle() {}
  public async stop() {}
}
