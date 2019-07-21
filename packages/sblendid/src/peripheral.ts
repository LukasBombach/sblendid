import { Bindings, AddressType, Advertisement } from "sblendid-bindings-macos";
import { CharacteristicConverter } from "./characteristic";
import Adapter from "./adapter";
import Service from "./service";

export interface ServiceConverters {
  [uuid: string]: CharacteristicConverter[];
}

export default class Peripheral {
  public readonly adapter: Adapter;
  public readonly uuid: string;
  public readonly address?: string;
  public readonly addressType?: string;
  public readonly connectable?: boolean;
  public readonly advertisement?: Advertisement;
  public rssi?: number;
  public serviceUuids?: BluetoothServiceUUID[];

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

  public async updateRssi(): Promise<this> {
    this.rssi = await this.fetchRssi();
    return this;
  }

  public async getService(
    uuid: BluetoothServiceUUID,
    converters: CharacteristicConverter[]
  ): Promise<Service> {
    return new Service(this, uuid, converters);
  }

  public async getServices(converters: ServiceConverters = {}): Promise<Service[]> {
    if (!this.serviceUuids) this.serviceUuids = await this.fetchServices();
    return this.serviceUuids.map(uuid => new Service(this, uuid, converters[uuid]));
  }

  private async fetchServices(): Promise<BluetoothServiceUUID[]> {
    const [, serviceUuids] = await this.adapter.run<"servicesDiscover">(
      () => this.adapter.discoverServices(this.uuid, []),
      () => this.adapter.when("servicesDiscover", ([uuid]) => uuid === this.uuid)
    );
    return serviceUuids;
  }

  private async fetchRssi(): Promise<number> {
    const [, rssi] = await this.adapter.run<"rssiUpdate">(
      () => this.adapter.updateRssi(this.uuid),
      () => this.adapter.when("rssiUpdate", uuid => uuid === this.uuid)
    );
    return rssi;
  }
}
