import { EventEmitter } from "events";

export default interface Bindings {
  init(): void;
  startScanning(serviceUuids?: BluetoothServiceUUID[], allowDuplicates?: boolean): void;
  stopScanning(): void;
  connect(peripheralUuid: string): void;
  disconnect(peripheralUuid: string): void;
  updateRssi(peripheralUuid: string): void;
  discoverServices(peripheralUuid: string, serviceUuid?: BluetoothServiceUUID[]): void;
  discoverIncludedServices(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, serviceUuids: BluetoothServiceUUID[]): void;
  discoverCharacteristics(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuids: BluetoothCharacteristicUUID[]): void;
  read(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID): void;
  write(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, data: Buffer, withoutResponse: boolean): void;
  notify(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, notify: boolean): void;
  discoverDescriptors(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID): void;
  readValue(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, descriptorUuid: BluetoothDescriptorUUID): void;
  writeValue(peripheralUuid: string, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, descriptorUuid: BluetoothDescriptorUUID, data: Buffer): void;
  readHandle(peripheralUuid: string, handle: () => void): void;
  writeHandle(peripheralUuid: string, handle: () => void, data: Buffer, withoutResponse: boolean): void;
  stop(): void;

  on(event: "stateChange", listener : (state: string) => void): EventEmitter;
  on(event: "addressChange", listener : (...args: any[]) => void): EventEmitter;
  on(event: "scanStart", listener : (...args: any[]) => void): EventEmitter;
  on(event: "scanStop", listener : (...args: any[]) => void): EventEmitter;
  on(event: "discover", listener : (...args: any[]) => void): EventEmitter;
  on(event: "connect", listener : (...args: any[]) => void): EventEmitter;
  on(event: "disconnect", listener : (...args: any[]) => void): EventEmitter;
  on(event: "rssiUpdate", listener : (...args: any[]) => void): EventEmitter;
  on(event: "servicesDiscover", listener : (...args: any[]) => void): EventEmitter;
  on(event: "includedServicesDiscover", listener : (...args: any[]) => void): EventEmitter;
  on(event: "characteristicsDiscover", listener : (...args: any[]) => void): EventEmitter;
  on(event: "read", listener : (...args: any[]) => void): EventEmitter;
  on(event: "write", listener : (...args: any[]) => void): EventEmitter;
  on(event: "broadcast", listener : (...args: any[]) => void): EventEmitter;
  on(event: "notify", listener : (...args: any[]) => void): EventEmitter;
  on(event: "descriptorsDiscover", listener : (...args: any[]) => void): EventEmitter;
  on(event: "valueRead", listener : (...args: any[]) => void): EventEmitter;
  on(event: "valueWrite", listener : (...args: any[]) => void): EventEmitter;
  on(event: "handleRead", listener : (...args: any[]) => void): EventEmitter;
  on(event: "handleWrite", listener : (...args: any[]) => void): EventEmitter;
  on(event: "handleNotify", listener : (...args: any[]) => void): EventEmitter;
}
