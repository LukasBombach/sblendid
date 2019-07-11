import { NoblePeripheral } from "../types/noble";

export type PeripheralState =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected";

export default class Peripheral {
  public readonly uuid: string;
  public readonly address: string;
  public readonly addressType: string;
  public readonly connectable: boolean;
  public readonly advertisement: Advertisement;
  public readonly rssi: number;
  public readonly services: Service[];
  public readonly state: PeripheralState;

  static fromNoble(noblePeripheral: NoblePeripheral): Peripheral {}

  connect(): Promise<void> {}
  disconnect(): Promise<void> {}
  updateRssi(): Promise<number> {}
  discoverServices(filter?: BluetoothServiceUUID[]): Promise<Service[]> {}
  discoverAllServicesAndCharacteristics(): Promise<Service[]> {}
}
