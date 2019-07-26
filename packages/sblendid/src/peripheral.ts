import { Advertisement, EventParameters } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";

export default class Peripheral {
  public adapter: Adapter;
  public uuid: string;
  public name?: string;
  public address?: string;
  public addressType?: string;
  public connectable?: boolean;
  public advertisement: Advertisement;
  public state: PeripheralState;
  private serviceUuids?: SUUID[];

  public static fromDiscover(adapter: Adapter, params: EventParameters<"discover">): Peripheral {
    const [uuid, address, addressType, connectable, advertisement = {}] = params;
    const peripheral = new Peripheral(adapter, uuid);
    peripheral.name = advertisement.localName;
    peripheral.address = address;
    peripheral.addressType = addressType;
    peripheral.connectable = connectable;
    peripheral.advertisement = advertisement;
    peripheral.state = "disconnected";
    return peripheral;
  }

  constructor(adapter: Adapter, uuid: string) {
    this.adapter = adapter;
    this.uuid = uuid;
    this.advertisement = {};
    this.state = "disconnected";
  }

  public async connect(): Promise<void> {
    this.state = "connecting";
    await this.dispatchConnect();
    this.state = "connected";
  }

  public async disconnect(): Promise<void> {
    this.state = "disconnecting";
    await this.dispatchDisconnect();
    this.state = "disconnected";
  }

  public async getService(uuid: SUUID, converters: CConverter[]): Promise<Service> {
    return new Service(this, uuid, converters);
  }

  public async getServices(converters: SConverters = {}): Promise<Service[]> {
    if (this.state === "disconnected") await this.connect();
    if (!this.serviceUuids) this.serviceUuids = await this.fetchServices();
    return this.serviceUuids.map(uuid => new Service(this, uuid, converters[uuid]));
  }

  public async hasService(uuid: SUUID): Promise<boolean> {
    const services = await this.getServices();
    return services.some(s => s.uuid === uuid);
  }

  public async getRssi(): Promise<number> {
    if (this.state === "disconnected") await this.connect();
    return await this.fetchRssi();
  }

  private async fetchServices(): Promise<SUUID[]> {
    return await this.adapter.run<"servicesDiscover">(
      () => this.adapter.discoverServices(this.uuid, []),
      () => this.adapter.when("servicesDiscover", this.uuid),
      ([, serviceUuids]) => serviceUuids
    );
  }

  private async fetchRssi(): Promise<number> {
    return await this.adapter.run<"rssiUpdate">(
      () => this.adapter.updateRssi(this.uuid),
      () => this.adapter.when("rssiUpdate", this.uuid),
      ([, rssi]) => rssi
    );
  }

  private async dispatchConnect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.connect(this.uuid),
      () => this.adapter.when("connect", this.uuid)
    );
  }

  private async dispatchDisconnect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.disconnect(this.uuid),
      () => this.adapter.when("disconnect", this.uuid)
    );
  }
}
