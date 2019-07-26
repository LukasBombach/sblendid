import {
  NobleCharacteristic,
  NobleCharacteristicProperty as NobleProp
} from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";
import { EventEmitter } from "events";

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

export default class Characteristic<T> {
  public uuid: CUUID;
  public properties?: Properties;
  public service: Service;
  private adapter: Adapter;
  private eventEmitter: EventEmitter;
  private isNotifying: boolean;
  private encode: Encoder<T>;
  private decode: Decoder<T>;

  public static fromNoble<T>(
    service: Service,
    noble: NobleCharacteristic,
    converter?: CConverter
  ): Characteristic<T> {
    const properties = Characteristic.noblePropsToSblendid(noble.properties);
    return new Characteristic(service, noble.uuid, converter, properties);
  }

  private static noblePropsToSblendid(nobleProps: NobleProp[]): Properties {
    const properties = Object.assign({}, defaultProperties);
    for (const name of nobleProps) properties[name] = true;
    return properties;
  }

  constructor(
    service: Service,
    uuid: CUUID,
    converter?: CConverter<T>,
    properties?: Properties
  ) {
    this.service = service;
    this.uuid = uuid;
    this.properties = properties;
    this.adapter = service.adapter;
    this.eventEmitter = new EventEmitter();
    this.isNotifying = false;
    this.encode = converter && converter.encode ? converter.encode : v => v;
    this.decode = converter && converter.decode ? converter.decode : v => v;
  }

  public async read(): Promise<any> {
    const buffer = await this.dispatchRead();
    return await this.decode(buffer);
  }

  public async write(value: any): Promise<void> {
    const buffer = await this.encode(value);
    await this.dispatchWrite(buffer);
  }

  public async on(event: "notify", listener: Listener<T>): Promise<void> {
    this.eventEmitter.on(event, listener);
    if (!this.isNotifying) await this.startNotifing();
  }

  public async off(event: "notify", listener: Listener<T>): Promise<void> {
    if (!this.eventEmitter.listenerCount("notify")) await this.stopNotifing();
    this.eventEmitter.off(event, listener);
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

  private onNotify(
    pUuid: string,
    sUuid: SUUID,
    cUuid: CUUID,
    data: Buffer,
    isNfy: boolean
  ): void {
    if (!this.isThis(pUuid, sUuid, cUuid) || !isNfy) return;
    this.eventEmitter.emit("notify", this.decode(data));
  }

  private isThis(pUuid: string, sUuid: SUUID, cUuid: CUUID): boolean {
    return pUuid === this.pUuid && sUuid === this.sUuid && cUuid === this.uuid;
  }

  private getUuids(): [string, SUUID, CUUID] {
    return [this.service.peripheral.uuid, this.service.uuid, this.uuid];
  }

  private async dispatchRead(): Promise<Buffer> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    return await this.adapter.run<"read", Buffer>(
      () => this.adapter.read(pUuid, sUuid, uuid),
      () => this.adapter.when("read", ([p, s, c]) => this.isThis(p, s, c)),
      ([, , , buffer]) => buffer
    );
  }

  private async dispatchWrite(value: Buffer): Promise<void> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    await this.adapter.run<"write">(
      () => this.adapter.write(pUuid, sUuid, uuid, value, true),
      () => this.adapter.when("write", (p, s, c) => this.isThis(p, s, c))
    );
  }

  private async notify(notify: boolean): Promise<boolean> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    return await this.adapter.run<"notify", boolean>(
      () => this.adapter.notify(pUuid, sUuid, uuid, notify),
      () => this.adapter.when("notify", (p, s, c) => this.isThis(p, s, c)),
      ([, , , state]) => state
    );
  }
}
