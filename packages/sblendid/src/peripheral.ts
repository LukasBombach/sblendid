import Sblendid from "./index";
import { AddressType, Advertisement } from "../types/bindings";
import Adapter from "./adapter";

export type PeripheralState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "error";

export default class Peripheral {
  public readonly adapter: Adapter;
  public readonly uuid: string;
  public readonly address?: string;
  public readonly addressType?: string;
  public readonly connectable?: boolean;
  public readonly advertisement?: Advertisement;
  public readonly rssi?: number;
  public readonly services: Service[];
  public readonly state: PeripheralState;

  constructor(
    adapter: Adapter,
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
      () => this.adapter.when("connect")
    );
  }

  public async disconnect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.disconnect(this.uuid),
      () => this.adapter.when("disconnect")
    );
  }

  public async updateRssi(): Promise<number> {
    const [, rssi] = await this.adapter.run<"rssiUpdate">(
      () => this.adapter.updateRssi(this.uuid),
      () => this.adapter.when("rssiUpdate")
    );
    return rssi;
  }

  public async discoverServices(filter?: BluetoothServiceUUID[]): Promise<Service[]> {
    const services = await this.adapter.run<"servicesDiscover">(
      () => this.adapter.discoverServices(this.uuid, filter),
      () => this.adapter.when("servicesDiscover")
    );
    return services;
  }

  public async discoverAllServicesAndCharacteristics(): Promise<Service[]> {}
}
