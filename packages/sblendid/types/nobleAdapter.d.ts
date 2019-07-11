export type NobleAdapterEvents = {
  stateChange: (state: string) => void;
  addressChange: (...args: any[]) => void;
  scanStart: (...args: any[]) => void;
  scanStop: (...args: any[]) => void;
  discover: (...args: any[]) => void;
  connect: (...args: any[]) => void;
  disconnect: (...args: any[]) => void;
  rssiUpdate: (...args: any[]) => void;
  servicesDiscover: (...args: any[]) => void;
  includedServicesDiscover: (...args: any[]) => void;
  characteristicsDiscover: (...args: any[]) => void;
  read: (...args: any[]) => void;
  write: (...args: any[]) => void;
  broadcast: (...args: any[]) => void;
  notify: (...args: any[]) => void;
  descriptorsDiscover: (...args: any[]) => void;
  valueRead: (...args: any[]) => void;
  valueWrite: (...args: any[]) => void;
  handleRead: (...args: any[]) => void;
  handleWrite: (...args: any[]) => void;
  handleNotify: (...args: any[]) => void;
};

export interface NobleAdapter {
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
