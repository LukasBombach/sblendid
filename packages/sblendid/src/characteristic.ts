import { NobleCharacteristic, Params } from "./bindings";
import Adapter from "./adapter";
import Service from "./service";
import { EventEmitter } from "events";

const defaultProperties: Properties = {
  read: false,
  write: false,
  notify: false
};

export default class Characteristic<T = Buffer> {
  public uuid: CUUID;
  public properties?: Properties;
  public service: Service;
  private adapter: Adapter;
  private converter?: Converter<T>;
  private eventEmitter = new EventEmitter();
  private isNotifying = false;

  public static fromNoble<T>(
    service: Service,
    noble: NobleCharacteristic,
    converter?: Converter<T>
  ): Characteristic<T> {
    const properties = Object.assign({}, defaultProperties);
    for (const name of noble.properties) properties[name] = true;
    return new Characteristic(service, noble.uuid, converter, properties);
  }

  constructor(
    service: Service,
    uuid: CUUID,
    converter?: Converter<T>,
    properties?: Properties
  ) {
    this.service = service;
    this.uuid = uuid;
    this.converter = converter;
    this.properties = properties;
    this.adapter = service.adapter;
  }

  public async read(): Promise<T> {
    const buffer = await this.dispatchRead();
    return await this.decode(buffer);
  }

  public async write(value: T): Promise<void> {
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

  private async decode(buffer: Buffer): Promise<T> {
    if (!this.converter || !this.converter.decode) return buffer as any;
    return await this.converter.decode(buffer);
  }

  private async encode(value: T): Promise<Buffer> {
    if (!this.converter || !this.converter.encode) return value as any;
    return await this.converter.encode(value);
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

  private async onNotify(...params: Params<"read">): Promise<void> {
    const [pUuid, sUuid, cUuid, data, isNfy] = params;
    if (!this.isThis(pUuid, sUuid, cUuid)) return;
    this.eventEmitter.emit("notify", await this.decode(data), { isNfy });
  }

  private isThis(pUuid: string, sUuid: SUUID, cUuid: CUUID): boolean {
    return this.getUuids().every((v, i) => v === [pUuid, sUuid, cUuid][i]);
  }

  private getUuids(): [string, SUUID, CUUID] {
    return [this.service.peripheral.uuid, this.service.uuid, this.uuid];
  }

  private async dispatchRead(): Promise<Buffer> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    return await this.adapter.run<"read", Buffer>(
      () => this.adapter.read(pUuid, sUuid, uuid),
      () => this.adapter.when("read", (p, s, c) => this.isThis(p, s, c)),
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
