export interface Advertisement {
  localName?: string;
  txPowerLevel?: number;
  serviceUuids?: BluetoothServiceUUID[];
  manufacturerData?: Buffer;
  serviceData?: ServiceData[];
}

export interface ServiceData {
  uuid: string;
  data: Buffer;
}

export interface Characteristic {
  uuid: string;
  properties: CharacteristicProperty[];
}

export type State = "poweredOn";
export type AddressType = "public" | "random" | "unknown";
export type CharacteristicProperty = "read" | "write" | "notify";

export type Event = keyof EventListeners;
export type Listener<E extends Event> = EventListeners[E];
export type Params<E extends Event> = Parameters<EventListeners[E]>;

declare class NobleAdapter {
  constructor();

  init(): void;

  startScanning(
    serviceUuids?: BluetoothServiceUUID[],
    allowDuplicates?: boolean
  ): void;

  stopScanning(): void;

  connect(peripheralUuid: string): void;

  disconnect(peripheralUuid: string): void;

  updateRssi(peripheralUuid: string): void;

  discoverServices(
    peripheralUuid: string,
    serviceUuids: BluetoothServiceUUID[]
  ): void;

  discoverIncludedServices(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    serviceUuids: BluetoothServiceUUID[]
  ): void;

  discoverCharacteristics(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuids: BluetoothCharacteristicUUID[]
  ): void;

  read(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void;

  write(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    data: Buffer,
    withoutResponse: boolean
  ): void;

  broadcast(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    broadcast: boolean
  ): void;

  notify(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    notify: boolean
  ): void;

  discoverDescriptors(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void;

  readValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID
  ): void;

  writeValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID,
    data: Buffer
  ): void;

  readHandle(peripheralUuid: string, handle: number): void;

  writeHandle(
    peripheralUuid: string,
    handle: number,
    data: Buffer,
    withoutResponse: boolean
  ): void;

  on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void | boolean> | void | boolean;

  off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void | boolean> | void | boolean;

  once<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void | boolean> | void | boolean;
}

export interface EventListeners {
  stateChange: (state: State) => void;

  discover: (
    peripheralUuid: string,
    address: string,
    addressType: AddressType,
    connectable: boolean,
    advertisement: Advertisement,
    rssi: number
  ) => void;

  connect: (peripheralUuid: string) => void;

  disconnect: (peripheralUuid: string) => void;

  rssiUpdate: (peripheralUuid: string, rssi: number) => void;

  servicesDiscover: (
    peripheralUuid: string,
    serviceUuids: BluetoothServiceUUID[]
  ) => void;

  includedServicesDiscover: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    includedServiceUuids: BluetoothServiceUUID[]
  ) => void;

  characteristicsDiscover: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristics: Characteristic[]
  ) => void;

  read: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    data: Buffer,
    isNotification: boolean
  ) => void;

  write: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ) => void;

  broadcast: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    state: string
  ) => void;

  notify: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    state: boolean
  ) => void;

  descriptorsDiscover: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptors: string[]
  ) => void;

  valueRead: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID,
    data: Buffer
  ) => void;

  valueWrite: (
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID
  ) => void;

  handleRead: (peripheralUuid: string, handle: number, data: Buffer) => void;

  handleWrite: (peripheralUuid: string, handle: number) => void;

  handleNotify: (peripheralUuid: string, handle: number, data: Buffer) => void;

  scanStart: () => void;

  scanStop: () => void;
}

export default NobleAdapter;
