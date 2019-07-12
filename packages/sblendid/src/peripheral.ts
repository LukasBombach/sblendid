import { NoblePeripheral } from "../types/noble";
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

  connect(): Promise<void> {
    Sblendid.adapter.connect(this.uuid);
  }
  disconnect(): Promise<void> {}
  updateRssi(): Promise<number> {}
  discoverServices(filter?: BluetoothServiceUUID[]): Promise<Service[]> {}
  discoverAllServicesAndCharacteristics(): Promise<Service[]> {}
}
