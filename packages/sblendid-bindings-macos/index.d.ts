declare module "sblendid-bindings-macos" {
  export type EventName = keyof Events;
  export type EventListener<E extends EventName> = (
    ...params: Parameters<Events[E]>
  ) => Promise<void | boolean> | void | boolean;
  export type EventParameters<E extends EventName> = Parameters<Events[E]>;
  export type EventReturnType<E extends EventName> = ReturnType<Events[E]>;

  export type Event = EventName;
  export type Listener<E extends EventName> = EventListener<E>;
  export type Params<E extends EventName> = EventParameters<E>;
  export type Return<E extends EventName> = EventReturnType<E>;

  export type State = "poweredOn";
  export type AddressType = "public" | "random" | "unknown";

  export interface Advertisement {
    localName?: string;
    txPowerLevel?: number;
    serviceUuids?: BluetoothServiceUUID[];
    manufacturerData?: Buffer;
    serviceData?: Buffer;
  }

  export interface NobleCharacteristic {
    uuid: string;
    properties: NobleCharacteristicProperty[];
  }

  export type NotifyState = boolean; // "true" | "false";

  export type NobleCharacteristicProperty = "read" | "write" | "notify";

  export class Bindings {
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

    on<E extends EventName>(
      event: E,
      listener: EventListener<E>
    ): Promise<void | boolean> | void | boolean;

    off<E extends EventName>(
      event: E,
      listener: EventListener<E>
    ): Promise<void | boolean> | void | boolean;

    once<E extends EventName>(
      event: E,
      listener: EventListener<E>
    ): Promise<void | boolean> | void | boolean;
  }

  export interface Events {
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
      characteristics: NobleCharacteristic[]
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
      state: NotifyState
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

    handleNotify: (
      peripheralUuid: string,
      handle: number,
      data: Buffer
    ) => void;

    scanStart: () => void;

    scanStop: () => void;
  }

  export const bindings: Bindings;
}
