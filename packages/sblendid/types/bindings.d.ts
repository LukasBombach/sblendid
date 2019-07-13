import { EventEmitter } from "events";

interface Events {
  stateChange: (state: string) => void;
  discover: (peripheralUuid, address, addressType, connectable, advertisement, rssi) => void;
  connect: (peripheralUuid) => void;
  disconnect: (peripheralUuid) => void;
  rssiUpdate: (peripheralUuid, rssi) => void;
  servicesDiscover: (peripheralUuid, serviceUuids) => void;
  includedServicesDiscover: (peripheralUuid, serviceUuid, includedServiceUuids) => void;
  characteristicsDiscover: (peripheralUuid, serviceUuid, characteristics) => void;
  read: (peripheralUuid, serviceUuid, characteristicUuid, data, isNotification) => void;
  write: (peripheralUuid, serviceUuid, characteristicUuid) => void;
  broadcast: (peripheralUuid, serviceUuid, characteristicUuid, state) => void;
  notify: (peripheralUuid, serviceUuid, characteristicUuid, state) => void;
  descriptorsDiscover: (peripheralUuid, serviceUuid, characteristicUuid, descriptors) => void;
  valueRead: (peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid, data) => void;
  valueWrite: (peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid) => void;
  handleRead: (peripheralUuid, handle, data) => void;
  handleWrite: (peripheralUuid, handle) => void;
  handleNotify: (peripheralUuid, handle, data) => void;
  scanStart: () => void;
  scanStop: () => void;
}

export default interface Bindings {

  init(): void;

  startScanning(serviceUuids, allowDuplicates): void;
  stopScanning(): void;
  connect(deviceUuid): void;
  disconnect(deviceUuid): void;
  updateRssi(deviceUuid): void;
  discoverServices(deviceUuid, uuids): void;
  discoverIncludedServices(deviceUuid, serviceUuid, serviceUuids): void;
  discoverCharacteristics(deviceUuid, serviceUuid, characteristicUuids): void;
  read(deviceUuid, serviceUuid, characteristicUuid): void;
  write(deviceUuid,serviceUuid,characteristicUuid,data,withoutResponse): void;
  broadcast(deviceUuid, serviceUuid, characteristicUuid, broadcast): void;
  notify(deviceUuid, serviceUuid, characteristicUuid, notify): void;
  discoverDescriptors(deviceUuid, serviceUuid, characteristicUuid): void;
  readValue(deviceUuid, serviceUuid, characteristicUuid, descriptorUuid): void;
  writeValue(deviceUuid,serviceUuid,characteristicUuid,descriptorUuid,data): void;
  readHandle(deviceUuid, handle): void;
  writeHandle(deviceUuid, handle, data, withoutResponse): void;

  // var data = event.data ? new Buffer(event.data, 'hex') : null;
  // var advertisement = event.advertisement;
  // advertisement = {
  //   localName: advertisement.localName,
  //   txPowerLevel: advertisement.txPowerLevel,
  //   serviceUuids: advertisement.serviceUuids,
  //   manufacturerData: (advertisement.manufacturerData ? new Buffer(advertisement.manufacturerData, 'hex') : null),
  //   serviceData: (advertisement.serviceData ? new Buffer(advertisement.serviceData, 'hex') : null)
  // };
  // this._peripherals[peripheralUuid] = {
  //   uuid: peripheralUuid,
  //   address: address,
  //   advertisement: advertisement,
  //   rssi: rssi
  // };

  // on(event: "stateChange", listener: (state: string) => void): EventEmitter;
  // on(event: "discover",listener: (peripheralUuid,address,addressType,connectable,advertisement,rssi) => void): EventEmitter;
  // on(event: "connect", listener: (peripheralUuid) => void): EventEmitter;
  // on(event: "disconnect", listener: (peripheralUuid) => void): EventEmitter;
  // on(event: "rssiUpdate",listener: (peripheralUuid, rssi) => void): EventEmitter;
  // on(event: "servicesDiscover",listener: (peripheralUuid, serviceUuids) => void): EventEmitter;
  // on(event: "includedServicesDiscover",listener: (peripheralUuid, serviceUuid, includedServiceUuids) => void): EventEmitter;
  // on(event: "characteristicsDiscover",listener: (peripheralUuid, serviceUuid, characteristics) => void): EventEmitter;
  // on(event: "read",listener: (peripheralUuid,serviceUuid,characteristicUuid,data,isNotification) => void): EventEmitter;
  // on(event: "write",listener: (peripheralUuid, serviceUuid, characteristicUuid) => void): EventEmitter;
  // on(event: "broadcast",listener: (peripheralUuid, serviceUuid, characteristicUuid, state) => void): EventEmitter;
  // on(event: "notify",listener: (peripheralUuid, serviceUuid, characteristicUuid, state) => void): EventEmitter;
  // on(event: "descriptorsDiscover",listener: (peripheralUuid,serviceUuid,characteristicUuid,descriptors) => void): EventEmitter;
  // on(event: "valueRead",listener: (peripheralUuid,serviceUuid,characteristicUuid,descriptorUuid,data) => void): EventEmitter;
  // on(event: "valueWrite",listener: (peripheralUuid,serviceUuid,characteristicUuid,descriptorUuid) => void): EventEmitter;
  // on(event: "handleRead",listener: (peripheralUuid, handle, data) => void): EventEmitter;
  // on(event: "handleWrite",listener: (peripheralUuid, handle) => void): EventEmitter;
  // on(event: "handleNotify",listener: (peripheralUuid, handle, data) => void): EventEmitter;
  // on(event: "scanStart", listener: () => void): EventEmitter;
  // on(event: "scanStop", listener: () => void): EventEmitter;
}
