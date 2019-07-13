import { NoblePeripheral } from "../../sblendid-trashbin/types/noble";
import Sblendid from "./index";

export type PeripheralState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "error";

export default class Peripheral {
  public readonly uuid: string;
  public readonly address: string;
  public readonly addressType: string;
  public readonly connectable: boolean;
  public readonly advertisement: Advertisement;
  public readonly rssi: number;
  public readonly services: Service[];
  public readonly state: PeripheralState;

  constructor(peripheral: NoblePeripheral) {
    this.uuid = peripheral.uuid;
    this.address = peripheral.address;
    this.addressType = peripheral.addressType;
    this.connectable = peripheral.connectable;
    this.advertisement = peripheral.advertisement;
    this.rssi = peripheral.rssi;
    this.services = peripheral.services;
    this.state = peripheral.state;
  }

  public async connect(): Promise<void> {
    await Promise.all([
      Sblendid.adapter.when("connect"),
      Sblendid.adapter.connect(this.uuid)
    ]);
  }

  public async disconnect(): Promise<void> {
    await Promise.all([
      Sblendid.adapter.when("disconnect"),
      Sblendid.adapter.disconnect(this.uuid)
    ]);
  }

  public async updateRssi(): Promise<number> {
    const [rssi] = await Promise.all([
      Sblendid.adapter.when("rssiUpdate"),
      Sblendid.adapter.updateRssi(this.uuid)
    ]);
    return parseFloat(rssi);
  }

  public async discoverServices(
    filter?: BluetoothServiceUUID[]
  ): Promise<Service[]> {
    const [services] = await Promise.all([
      Sblendid.adapter.when("servicesDiscover"),
      Sblendid.adapter.discoverServices(this.uuid, filter)
    ]);
    return services;
  }

  public async discoverAllServicesAndCharacteristics(): Promise<Service[]> {}
}
