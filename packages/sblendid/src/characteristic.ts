import { NobleCharacteristic, NobleCharacteristicProperty } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";
import { EventEmitter } from "events";

export type Listener = (value: Buffer) => Promise<void> | void;
export type Encoder = (value: any) => Promise<Buffer> | Buffer;
export type Decoder = (value: Buffer) => Promise<any> | any;

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
  public readonly uuid: CUUID;
  public readonly properties?: Properties;
  public adapter: Adapter;
  public service: Service;

  private pUuid: string;
  private sUuid: SUUID;
  private eventEmitter: EventEmitter;
  private isNotifying: boolean;
  private descriptors?: string[];
  private encode: Encoder;
  private decode: Decoder;

  public static fromNoble(
    service: Service,
    noble: NobleCharacteristic,
    converter?: CConverter
  ): Characteristic {
    const { uuid, properties } = noble;
    return new Characteristic(
      service,
      uuid,
      converter,
      Characteristic.noblePropsToSblendid(properties)
    );
  }

  private static noblePropsToSblendid(nobleProperties: NobleCharacteristicProperty[]): Properties {
    const properties = Object.assign({}, defaultProperties);
    for (const property of nobleProperties) properties[property] = true;
    return properties;
  }

  constructor(service: Service, uuid: CUUID, converter?: CConverter, properties?: Properties) {
    this.adapter = service.adapter;
    this.service = service;
    this.uuid = uuid;
    this.pUuid = this.service.peripheral.uuid;
    this.sUuid = this.service.uuid;
    this.properties = properties;
    this.eventEmitter = new EventEmitter();
    this.isNotifying = false;
    this.decode = converter && converter.decode ? converter.decode : v => v;
    this.encode = converter && converter.encode ? converter.encode : v => v;
  }

  public async read(): Promise<any> {
    const buffer = await this.dispatchRead();
    return await this.decode(buffer);
  }

  public async write(value: any): Promise<void> {
    const buffer = await this.encode(value);
    await this.dispatchWrite(buffer);
  }

  public async on(event: "notify", listener: Listener): Promise<void> {
    this.eventEmitter.on(event, listener);
    if (!this.isNotifying) await this.startNotifing();
  }

  public async off(event: "notify", listener: Listener): Promise<void> {
    if (!this.eventEmitter.listenerCount("notify")) await this.stopNotifing();
    this.eventEmitter.off(event, listener);
  }

  public async getDescriptors(): Promise<string[]> {
    if (!this.descriptors) this.descriptors = await this.fetchDescriptors();
    return this.descriptors;
  }

  private async startNotifing(): Promise<void> {
    if (this.isNotifying) return;
    this.adapter.on("read", this.onNotify.bind(this));
    this.isNotifying = await this.notify(true);
  }

  private async stopNotifing(): Promise<void> {
    if (!this.isNotifying) return;
    this.adapter.off("read", this.onNotify.bind(this));
    this.isNotifying = await this.notify(false);
  }

  private onNotify(pUuid: string, sUuid: SUUID, cUuid: CUUID, data: Buffer, isNfy: boolean): void {
    if (this.isThis(pUuid, sUuid, cUuid) && isNfy)
      this.eventEmitter.emit("notify", this.encode(data));
  }

  private isThis(pUuid: string, sUuid: SUUID, cUuid: CUUID): boolean {
    return pUuid === this.pUuid && sUuid === this.sUuid && cUuid === this.uuid;
  }

  private async dispatchRead(): Promise<Buffer> {
    return await this.adapter.run<"read">(
      () => this.adapter.read(this.pUuid, this.sUuid, this.uuid),
      () => this.adapter.when("read", ([p, s, c]) => this.isThis(p, s, c)),
      ([, , , buffer]) => buffer
    );
  }

  private async dispatchWrite(value: Buffer): Promise<void> {
    await this.adapter.run<"write">(
      () => this.adapter.write(this.pUuid, this.sUuid, this.uuid, value, true),
      () => this.adapter.when("write", ([p, s, c]) => this.isThis(p, s, c))
    );
  }

  private async notify(notify: boolean): Promise<boolean> {
    return await this.adapter.run<"notify">(
      () => this.adapter.notify(this.pUuid, this.sUuid, this.uuid, notify),
      () => this.adapter.when("notify", ([p, s, c]) => this.isThis(p, s, c)),
      ([, , , state]) => state
    );
  }

  private async fetchDescriptors(): Promise<string[]> {
    return await this.adapter.run<"descriptorsDiscover">(
      () => this.adapter.discoverDescriptors(this.pUuid, this.sUuid, this.uuid),
      () => this.adapter.when("descriptorsDiscover", ([p, s, c]) => this.isThis(p, s, c)),
      ([, , , desciptors]) => desciptors
    );
  }
}
