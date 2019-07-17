import { Bindings, AddressType, Advertisement } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";

type UUID = BluetoothServiceUUID;

export default class Peripheral {
  public readonly adapter: Adapter;
  public readonly uuid: string;
  public readonly address?: string;
  public readonly addressType?: string;
  public readonly connectable?: boolean;
  public readonly advertisement?: Advertisement;
  public rssi?: number;
  public services?: Service[];

  constructor(
    adapter: Adapter & Bindings,
    uuid: string,
    address?: string,
    addressType?: AddressType,
    connectable?: boolean,
    advertisement?: Advertisement,
    rssi?: number
  ) {
    this.adapter = adapter;
    this.uuid = uuid;
    this.address = address;
    this.addressType = addressType;
    this.connectable = connectable;
    this.advertisement = advertisement;
    this.rssi = rssi;
  }

  public async connect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.connect(this.uuid),
      () => this.adapter.when("connect", () => true)
    );
  }

  public async disconnect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.disconnect(this.uuid),
      () => this.adapter.when("disconnect", () => true)
    );
  }

  public async init(): Promise<this> {
    this.services = await this.fetchServices();
    for (const service of this.services) await service.init();
    return this;
  }

  public async updateRssi(): Promise<this> {
    this.rssi = await this.fetchRssi();
    return this;
  }

  public async getServices(filter?: UUID[]): Promise<Service[]> {
    if (!this.services) this.services = await this.fetchServices(filter);
    return this.services;
  }

  private async fetchServices(filter: UUID[] = []): Promise<Service[]> {
    const [, serviceUuids] = await this.adapter.run<"servicesDiscover">(
      () => this.adapter.discoverServices(this.uuid, filter),
      () => this.adapter.when("servicesDiscover", uuid => uuid === this.uuid)
    );
    return serviceUuids.map(uuid => new Service(uuid));
  }

  private async fetchRssi(): Promise<number> {
    const [, rssi] = await this.adapter.run<"rssiUpdate">(
      () => this.adapter.updateRssi(this.uuid),
      () => this.adapter.when("rssiUpdate", uuid => uuid === this.uuid)
    );
    return rssi;
  }
}
