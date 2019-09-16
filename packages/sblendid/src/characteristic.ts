import { EventEmitter } from "events";
import Adapter, { Params } from "@sblendid/adapter-node";
import Service from "./service";

export interface Converter<T = Buffer> {
  uuid: CUUID;
  decode?: (value: Buffer) => Promish<T>;
  encode?: (value: T) => Promish<Buffer>;
}

export interface Properties {
  read?: boolean;
  write?: boolean;
  notify?: boolean;
}

export interface Options<C extends MaybeConverter> {
  properties?: Properties;
  converter?: C;
}

export type Value<C> = C extends Converter<infer V> ? V : Buffer;
export type Listener<C> = (value: Value<C>) => Promish<void>;
export type MaybeConverter = Converter<any> | undefined;

export default class Characteristic<C extends MaybeConverter = undefined> {
  public uuid: CUUID;
  public service: Service<any>;
  public properties: Properties;
  private eventEmitter = new EventEmitter();
  private converter?: C;

  constructor(uuid: CUUID, service: Service<any>, options: Options<C> = {}) {
    this.uuid = uuid;
    this.service = service;
    this.properties = options.properties || {};
    this.converter = options.converter;
  }

  public async read(): Promise<Value<C>> {
    const [puuid, suuid, uuid] = this.getUuids();
    const buffer = await this.getAdapter().read(puuid, suuid, uuid);
    return await this.decode(buffer);
  }

  public async write(
    value: Value<C>,
    withoutResponse?: boolean
  ): Promise<void> {
    const [puuid, suuid, uuid] = this.getUuids();
    const buffer = await this.encode(value);
    await this.getAdapter().write(puuid, suuid, uuid, buffer, withoutResponse);
  }

  public async on(event: "notify", listener: Listener<C>): Promise<void> {
    this.eventEmitter.on(event, listener);
    const isFirstListener = this.eventEmitter.listenerCount("notify") === 1;
    if (isFirstListener) await this.startNotifing();
  }

  public async off(event: "notify", listener: Listener<C>): Promise<void> {
    this.eventEmitter.off(event, listener);
    const wasLastListener = this.eventEmitter.listenerCount("notify") === 0;
    if (wasLastListener) await this.stopNotifing();
  }

  private async decode(buffer: Buffer): Promise<Value<C>> {
    const error = "Cannot read using a converter without a decode method";
    if (!this.converter) return buffer as Value<C>;
    if (!this.converter.decode) throw new Error(error);
    return await this.converter.decode(buffer);
  }

  private async encode(value: Value<C>): Promise<Buffer> {
    const error = "Cannot write using a converter without an encode method";
    if (!this.converter) return value;
    if (!this.converter.encode) throw new Error(error);
    return await this.converter.encode(value);
  }

  private async startNotifing(): Promise<void> {
    const [puuid, suuid, uuid] = this.getUuids();
    const error = `Failed to turn on notifications for ${uuid}`;
    const adapter = this.getAdapter();
    adapter.on("read", this.onNotify.bind(this));
    const notify = await adapter.notify(puuid, suuid, uuid, true);
    if (notify !== true) throw new Error(error);
  }

  private async stopNotifing(): Promise<void> {
    const [puuid, suuid, uuid] = this.getUuids();
    const error = `Failed to turn off notifications for ${uuid}`;
    const adapter = this.getAdapter();
    adapter.off("read", this.onNotify.bind(this));
    const notify = await adapter.notify(puuid, suuid, uuid, false);
    if (notify !== false) throw new Error(error);
  }

  private async onNotify(...params: Params<"read">): Promise<void> {
    const [puuid, suuid, cuuid, data, isNotification] = params;
    if (!isNotification || !this.isThis(puuid, suuid, cuuid)) return;
    this.eventEmitter.emit("notify", await this.decode(data));
  }

  private getAdapter(): Adapter {
    return this.service.peripheral.adapter;
  }

  private getUuids(): [PUUID, SUUID, CUUID] {
    return [this.service.peripheral.uuid, this.service.uuid, this.uuid];
  }

  private isThis(puuid: PUUID, suuid: SUUID, cuuid: CUUID): boolean {
    return this.getUuids().every((v, i) => v === [puuid, suuid, cuuid][i]);
  }
}
