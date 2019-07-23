import { Bindings, AddressType, Advertisement } from "sblendid-bindings-macos";
import { CharacteristicConverter } from "./characteristic";
import Adapter from "./adapter";
import Service from "./service";

export interface ServiceConverters {
  [uuid: string]: CharacteristicConverter[];
}

export type PeripheralState = "connecting" | "connected" | "disconnecting" | "disconnected";

export default class Peripheral {
  public readonly adapter: Adapter;
  public readonly uuid: string;
  public readonly address?: string;
  public readonly addressType?: string;
  public readonly connectable?: boolean;
  public readonly advertisement?: Advertisement;
  public readonly manufacturerData: Buffer;
  public rssi?: number;
  public state: PeripheralState;
  private serviceUuids?: SUUID[];

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
    this.manufacturerData = this.getManufacturerData(advertisement);
    this.state = "disconnected";
  }

  public async connect(): Promise<void> {
    this.state = "connecting";
    await this.adapter.run(
      () => this.adapter.connect(this.uuid),
      () => this.adapter.when("connect", this.uuid)
    );
    this.state = "connected";
  }

  public async disconnect(): Promise<void> {
    this.state = "disconnecting";
    await this.adapter.run(
      () => this.adapter.disconnect(this.uuid),
      () => this.adapter.when("disconnect", this.uuid)
    );
    this.state = "disconnected";
  }

  public async updateRssi(): Promise<this> {
    this.rssi = await this.fetchRssi();
    return this;
  }

  public async getService(uuid: SUUID, converters: CharacteristicConverter[]): Promise<Service> {
    const service = new Service(this, uuid, converters);
    await service.getCharacteristics();
    return service;
  }

  public async getServices(converters: ServiceConverters = {}): Promise<Service[]> {
    if (!this.serviceUuids) this.serviceUuids = await this.fetchServices();
    return this.serviceUuids.map(uuid => new Service(this, uuid, converters[uuid]));
  }

  public async hasService(uuid: SUUID): Promise<boolean> {
    const services = await this.getServices();
    return services.some(s => s.uuid === uuid);
  }

  private async fetchServices(): Promise<SUUID[]> {
    if (this.state === "disconnected") await this.connect();
    const [, serviceUuids] = await this.adapter.run<"servicesDiscover">(
      () => this.adapter.discoverServices(this.uuid, []),
      () => this.adapter.when("servicesDiscover", this.uuid)
    );
    return serviceUuids;
  }

  private async fetchRssi(): Promise<number> {
    if (this.state === "disconnected") await this.connect();
    const [, rssi] = await this.adapter.run<"rssiUpdate">(
      () => this.adapter.updateRssi(this.uuid),
      () => this.adapter.when("rssiUpdate", this.uuid)
    );
    return rssi;
  }

  private getManufacturerData(advertisement?: Advertisement): Buffer {
    if (advertisement && advertisement.manufacturerData) return advertisement.manufacturerData;
    return Buffer.from("");
  }
}
