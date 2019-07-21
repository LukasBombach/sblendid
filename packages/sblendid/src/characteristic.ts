import { NobleCharacteristic, NobleCharacteristicProperty } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";
import { EventEmitter } from "events";

export type Listener = (value: Buffer) => Promise<void> | void;

export interface CharacteristicConverter {
  uuid: string;
  name: string;
  encode?: (...args: any[]) => Buffer;
  decode?: (buffer: Buffer) => any;
}

export interface Properties {
  broadcast: boolean;
  read: boolean;
  writeWithoutResponse: boolean;
  write: boolean;
  notify: boolean;
  indicate: boolean;
  authenticatedSignedWrites: boolean;
  reliableWrite: boolean;
  writableAuxiliaries: boolean;
}

const defaultProperties: Properties = {
  broadcast: false,
  read: false,
  writeWithoutResponse: false,
  write: false,
  notify: false,
  indicate: false,
  authenticatedSignedWrites: false,
  reliableWrite: false,
  writableAuxiliaries: false
};

export default class Characteristic {
  public readonly uuid: BluetoothCharacteristicUUID;
  public readonly properties: Properties;
  public adapter: Adapter;
  public service: Service;

  private peripheralUuid: string;
  private serviceUuid: BluetoothServiceUUID;
  private eventEmitter: EventEmitter;
  private isNotifying: boolean;
  private descriptors?: string[];

  constructor(service: Service, { uuid, properties }: NobleCharacteristic) {
    this.adapter = service.adapter;
    this.service = service;
    this.uuid = uuid;
    this.peripheralUuid = this.service.peripheral.uuid;
    this.serviceUuid = this.service.uuid;
    this.properties = this.noblePropsToSblendid(properties);
    this.eventEmitter = new EventEmitter();
    this.isNotifying = false;
  }

  public async read(): Promise<Buffer> {
    const { peripheralUuid, serviceUuid, uuid } = this;
    const [, , , buffer] = await this.adapter.run<"read">(
      () => this.adapter.read(peripheralUuid, serviceUuid, uuid),
      () => this.adapter.when("read", ([p, s, c]) => this.isThisCharacteristic(p, s, c))
    );
    return buffer;
  }

  public async write(value: Buffer, withoutResponse?: boolean): Promise<void> {
    if (typeof withoutResponse !== "undefined")
      throw new Error("withoutResponse is not Implemented yet");
    const { peripheralUuid, serviceUuid, uuid } = this;
    await this.adapter.run<"write">(
      () => this.adapter.write(peripheralUuid, serviceUuid, uuid, value, true),
      () => this.adapter.when("write", ([p, s, c]) => this.isThisCharacteristic(p, s, c))
    );
  }

  public async getDescriptors(): Promise<string[]> {
    if (!this.descriptors) this.descriptors = await this.fetchDescriptors();
    return this.descriptors;
  }

  public async on(event: "notify", listener: Listener): Promise<void> {
    this.eventEmitter.on(event, listener);
    if (!this.isNotifying) await this.notify(true);
  }

  public async off(event: "notify", listener: Listener): Promise<void> {
    if (!this.eventEmitter.listenerCount("notify")) await this.notify(false);
    this.eventEmitter.off(event, listener);
  }

  private async notify(notify: boolean): Promise<void> {
    const { peripheralUuid, serviceUuid, uuid } = this;
    const [, , , state] = await this.adapter.run<"notify">(
      () => this.adapter.notify(peripheralUuid, serviceUuid, uuid, notify),
      () => this.adapter.when("notify", ([p, s, c]) => this.isThisCharacteristic(p, s, c))
    );
    this.isNotifying = state;
  }

  private async fetchDescriptors(): Promise<string[]> {
    const { peripheralUuid, serviceUuid, uuid } = this;
    const [, , , desciptors] = await this.adapter.run<"descriptorsDiscover">(
      () => this.adapter.discoverDescriptors(peripheralUuid, serviceUuid, uuid),
      () =>
        this.adapter.when("descriptorsDiscover", ([p, s, c]) => this.isThisCharacteristic(p, s, c))
    );
    return desciptors;
  }

  private noblePropsToSblendid(nobleProperties: NobleCharacteristicProperty[]): Properties {
    const properties = Object.assign({}, defaultProperties);
    for (const property of nobleProperties) properties[property] = true;
    return properties;
  }

  private isThisCharacteristic(
    pUuid: string,
    sUuid: BluetoothServiceUUID,
    cUuid: BluetoothCharacteristicUUID
  ): boolean {
    return pUuid === this.peripheralUuid && sUuid === this.serviceUuid && cUuid === this.uuid;
  }
}
