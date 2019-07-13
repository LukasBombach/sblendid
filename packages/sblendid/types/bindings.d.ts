import { EventEmitter } from "events";

type PeripheralUuid = string;
type Address = string;
type AddressType = "public" |"random" |"unknown";
type Descriptor = string;

export interface Advertisement {
  localName: string;
  txPowerLevel: number;
  serviceUuids: BluetoothServiceUUID[]; 
  manufacturerData?: Buffer;
  serviceData?: Buffer;
}

interface Events {
  stateChange: (state: string) => void;
  discover: (peripheralUuid: PeripheralUuid, address: Address, addressType: AddressType, connectable: boolean, advertisement: Advertisement, rssi: number) => void;
  connect: (peripheralUuid: PeripheralUuid) => void;
  disconnect: (peripheralUuid: PeripheralUuid) => void;
  rssiUpdate: (peripheralUuid: PeripheralUuid, rssi: number) => void;
  servicesDiscover: (peripheralUuid: PeripheralUuid, serviceUuids: BluetoothServiceUUID[]) => void;
  includedServicesDiscover: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, includedServiceUuids: BluetoothServiceUUID[]) => void;
  characteristicsDiscover: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristics: BluetoothCharacteristicUUID[]) => void;
  read: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, data: Buffer, isNotification: boolean) => void;
  write: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID) => void;
  broadcast: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, state: string) => void;
  notify: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, state: string) => void;
  descriptorsDiscover: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, descriptors: Descriptor[]) => void;
  valueRead: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, descriptorUuid: BluetoothDescriptorUUID, data: Buffer) => void;
  valueWrite: (peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, descriptorUuid: BluetoothDescriptorUUID) => void;
  handleRead: (peripheralUuid: PeripheralUuid, handle: number, data: Buffer) => void;
  handleWrite: (peripheralUuid: PeripheralUuid, handle: number) => void;
  handleNotify: (peripheralUuid: PeripheralUuid, handle: number, data: Buffer) => void;
  scanStart: () => void;
  scanStop: () => void;
}

export default interface Bindings {
  init(): void;
  startScanning(serviceUuids: BluetoothServiceUUID[], allowDuplicates: boolean): void;
  stopScanning(): void;
  connect(peripheralUuid: PeripheralUuid): void;
  disconnect(peripheralUuid: PeripheralUuid): void;
  updateRssi(peripheralUuid: PeripheralUuid): void;
  discoverServices(peripheralUuid: PeripheralUuid, serviceUuids: BluetoothServiceUUID[]): void;
  discoverIncludedServices(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, serviceUuids: BluetoothServiceUUID[]): void;
  discoverCharacteristics(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuids: BluetoothCharacteristicUUID[]): void;
  read(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID): void;
  write(peripheralUuid: PeripheralUuid,serviceUuid: BluetoothServiceUUID,characteristicUuid: BluetoothCharacteristicUUID,data: Buffer,withoutResponse: boolean): void;
  broadcast(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, broadcast: boolean): void;
  notify(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, notify: boolean): void;
  discoverDescriptors(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID): void;
  readValue(peripheralUuid: PeripheralUuid, serviceUuid: BluetoothServiceUUID, characteristicUuid: BluetoothCharacteristicUUID, descriptorUuid: BluetoothDescriptorUUID): void;
  writeValue(peripheralUuid: PeripheralUuid,serviceUuid: BluetoothServiceUUID,characteristicUuid: BluetoothCharacteristicUUID,descriptorUuid: BluetoothDescriptorUUID,data: Buffer): void;
  readHandle(peripheralUuid: PeripheralUuid, handle: number): void;
  writeHandle(peripheralUuid: PeripheralUuid, handle: number, data: Buffer, withoutResponse: boolean): void;
}

