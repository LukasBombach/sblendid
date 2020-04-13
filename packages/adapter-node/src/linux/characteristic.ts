import { Characteristic as CharacteristicJSON } from "../../types/adapter";
import { GattCharacteristic1 } from "../../types/bluez";
import List from "../list";

export interface Flags {
  read: boolean;
  write: boolean;
  notify: boolean;
}

export default class Characteristic {
  private static characteristics = new List<Characteristic>();
  public readonly uuid: CUUID;
  public readonly serviceUUID: SUUID;
  public readonly path: string;
  public readonly gattCharacteristic1: GattCharacteristic1;

  static add(service: Characteristic): void {
    Characteristic.characteristics.add(service);
  }

  static find(cUUID: CUUID): Characteristic | undefined {
    return Characteristic.characteristics.find((c) => c.uuid === cUUID);
  }

  static findByService(sUUID: SUUID): Characteristic[] {
    return Characteristic.characteristics.findAll((s) => s.uuid === sUUID);
  }

  constructor(path: string, gattCharacteristic1: GattCharacteristic1) {
    this.path = path;
    this.uuid = gattCharacteristic1.UUID;
    this.serviceUUID = gattCharacteristic1.Service.UUID;
    this.gattCharacteristic1 = gattCharacteristic1;
  }

  public async read(): Promise<Buffer> {}

  public async write(value: Buffer, withoutResponse: boolean): Promise<void> {}

  public async notify(notify: boolean): Promise<boolean> {}

  public serialize(): CharacteristicJSON {
    return { uuid: this.uuid, ...this.getFlags() };
  }

  private getFlags(): Flags {
    const read = this.gattCharacteristic1.Flags.includes("read");
    const write = this.gattCharacteristic1.Flags.includes("write");
    const notify = this.gattCharacteristic1.Flags.includes("notify");
    return { read, write, notify };
  }
}
