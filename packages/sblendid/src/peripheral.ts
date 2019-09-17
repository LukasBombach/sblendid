import Adapter, { AddressType, Advertisement } from "@sblendid/adapter-node";
import Service, { MaybeConverters } from "./service";

export interface Options {
  address: string;
  addressType: AddressType;
  advertisement: Advertisement;
  connectable?: boolean;
}

export type ServiceConverters = Record<SUUID, MaybeConverters>;

export type State =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected";

export default class Peripheral {
  public uuid: PUUID;
  public adapter: Adapter;
  public name: string;
  public address: string;
  public addressType: AddressType;
  public advertisement: Advertisement = {};
  public connectable?: boolean;
  public state: State = "disconnected";
  private serviceUuids?: SUUID[];

  constructor(uuid: PUUID, adapter: Adapter, options: Options) {
    this.uuid = uuid;
    this.adapter = adapter;
    this.name = options.advertisement.localName || "";
    this.address = options.address;
    this.addressType = options.addressType;
    this.advertisement = options.advertisement;
    this.connectable = options.connectable;
  }

  public async connect(): Promise<void> {
    if (this.state !== "disconnected") return;
    this.state = "connecting";
    await this.adapter.connect(this.uuid);
    this.state = "connected";
  }

  public async disconnect(): Promise<void> {
    if (this.state !== "connected") return;
    this.state = "disconnecting";
    await this.adapter.disconnect(this.uuid);
    this.state = "disconnected";
  }

  public async getService<C extends MaybeConverters>(
    uuid: SUUID,
    converters?: C
  ): Promise<Service<C> | undefined> {
    const serviceConverters = converters ? { [uuid]: converters } : undefined;
    const services = await this.getServices(serviceConverters);
    return services.find(s => s.uuid === uuid);
  }

  public async getServices(
    serviceConverters?: ServiceConverters
  ): Promise<Service<any>[]> {
    if (this.state === "disconnected") await this.connect();
    const uuids = await this.getSUUIDs();
    return uuids.map(uuid => this.getServiceForUUID(uuid, serviceConverters));
  }

  public async hasService(uuid: SUUID): Promise<boolean> {
    const services = await this.getServices();
    return services.some(s => s.uuid === uuid);
  }

  public async getRssi(): Promise<number> {
    if (this.state === "disconnected") await this.connect();
    return await this.adapter.getRssi(this.uuid);
  }

  public isConnected(): boolean {
    return this.state === "connected";
  }

  // todo this can probably be mapped to Service<Converters>
  private getServiceForUUID(
    uuid: SUUID,
    serviceConverters: ServiceConverters = {}
  ): Service<any> {
    const converters = serviceConverters[uuid];
    return new Service(uuid, this, { converters });
  }

  private async getSUUIDs(): Promise<SUUID[]> {
    if (this.serviceUuids) return this.serviceUuids;
    this.serviceUuids = await this.adapter.getServices(this.uuid);
    return this.serviceUuids;
  }
}
