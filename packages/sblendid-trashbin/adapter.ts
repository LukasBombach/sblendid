import ExtendedEventEmitter from "./extendedEventEmitter";

export default class Adapter extends ExtendedEventEmitter {
  public init(): void {}
  public startScanning(
    serviceUuids?: BluetoothServiceUUID[],
    allowDuplicates?: boolean
  ): void {}
  public stopScanning(): void {}
  public connect(peripheralUuid: string): void {}
  public disconnect(peripheralUuid: string): void {}
  public updateRssi(peripheralUuid: string): void {}
  public discoverServices(
    peripheralUuid: string,
    serviceUuid?: BluetoothServiceUUID[]
  ): void {}
  public discoverIncludedServices(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    serviceUuids: BluetoothServiceUUID[]
  ): void {}
  public discoverCharacteristics(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuids: BluetoothCharacteristicUUID[]
  ): void {}
  public read(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void {}
  public write(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    data: Buffer,
    withoutResponse: boolean
  ): void {}
  public notify(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    notify: boolean
  ): void {}
  public discoverDescriptors(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void {}
  public readValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID
  ): void {}
  public writeValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID,
    data: Buffer
  ): void {}
  public readHandle(peripheralUuid: string, handle: () => void): void {}
  public writeHandle(
    peripheralUuid: string,
    handle: () => void,
    data: Buffer,
    withoutResponse: boolean
  ): void {}
  public stop(): void {}
}

// This is for debugging while development
// const adapter = new Adapter();
// adapter.on("stateChange", () => {});
