import { EventEmitter } from "events";
import {
  Bindings,
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "sblendid-bindings-macos";
import Peripheral from "../src/peripheral";

export interface Converters {
  discover: (...args: Params<"discover">) => Peripheral;
}

export type Converters2 = Record<Event, () => any>;

export interface EventOptions {
  convert: boolean;
}

export type ConvListener<E extends keyof Converters2> = Converters2[E];
export type AnyListener<E extends Event> = Listener<E> | ConvListener<E>;

export default class Adapter {
  private bindings: Bindings;
  private convertEmitter: EventEmitter;

  private converters: Converters = {
    discover: (...args: Params<"discover">) =>
      this.convertEmitter.emit("discover", Peripheral.fromDiscover(this, args))
  };

  constructor(bindings: Bindings = new Bindings()) {
    this.bindings = bindings;
    this.convertEmitter = new EventEmitter();
    this.convertEmitter.on("newListener", this.onNewConvertListener.bind(this));
    this.convertEmitter.on("removeListener", this.onRemoveConvertListener.bind(this));
  }

  init(): void;

  startScanning(serviceUuids?: BluetoothServiceUUID[], allowDuplicates?: boolean): void {}

  stopScanning(): void {}

  connect(peripheralUuid: string): void {}

  disconnect(peripheralUuid: string): void {}

  updateRssi(peripheralUuid: string): void {}

  discoverServices(peripheralUuid: string, serviceUuids: BluetoothServiceUUID[]): void {}

  discoverIncludedServices(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    serviceUuids: BluetoothServiceUUID[]
  ): void {}

  discoverCharacteristics(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuids: BluetoothCharacteristicUUID[]
  ): void {}

  read(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void {}

  write(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    data: Buffer,
    withoutResponse: boolean
  ): void {}

  broadcast(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    broadcast: boolean
  ): void {}

  notify(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    notify: boolean
  ): void {}

  discoverDescriptors(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void {}

  readValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID
  ): void {}

  writeValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID,
    data: Buffer
  ): void {}

  readHandle(peripheralUuid: string, handle: number): void {}

  writeHandle(
    peripheralUuid: string,
    handle: number,
    data: Buffer,
    withoutResponse: boolean
  ): void {}

  public on<E extends Event>(event: E, listener: Listener<E>): void;
  public on<E extends Event>(event: E, listener: ConvListener<E>, options: EventOptions): void;
  public on<E extends Event>(event: E, listener: AnyListener<E>, options?: EventOptions): void {
    if (options && options.convert) {
      this.convertEmitter.on(event, listener);
    } else {
      this.bindings.on(event, listener);
    }
  }

  public once<E extends Event>(event: E, listener: Listener<E>): void;
  public once<E extends Event>(event: E, listener: ConvListener<E>, options: EventOptions): void;
  public once<E extends Event>(event: E, listener: AnyListener<E>, options?: EventOptions): void {
    if (options && options.convert) {
      this.convertEmitter.once(event, listener);
    } else {
      this.bindings.once(event, listener);
    }
  }

  public off<E extends Event>(event: E, listener: AnyListener<E>): void {
    if (this.convertEmitter.listeners(event).includes(listener)) {
      this.convertEmitter.off(event, listener);
    } else {
      this.bindings.off(event, listener);
    }
  }

  private onNewConvertListener(event: Event): void {
    if (this.convertEmitter.listenerCount(event) > 0) return;
    this.bindings.on(event, this.converters[event]);
  }

  private onRemoveConvertListener(event: Event): void {
    if (this.convertEmitter.listenerCount(event) > 0) return;
    this.bindings.off(event, this.converters[event]);
  }
}
