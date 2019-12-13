import { GattCharacteristic1 } from "../../types/bluez";
import List from "../list";

export default class Characteristic {
  private static characteristics = new List<Characteristic>();
  public readonly uuid: CUUID;
  public readonly path: string;
  public readonly gattCharacteristic1: GattCharacteristic1;

  static add(service: Characteristic): void {
    Characteristic.characteristics.add(service);
  }

  static find(sUUID: SUUID): Characteristic | undefined {
    return Characteristic.characteristics.find(s => s.uuid === sUUID);
  }

  constructor(path: string, gattCharacteristic1: GattCharacteristic1) {
    this.path = path;
    this.uuid = gattCharacteristic1.UUID;
    this.gattCharacteristic1 = gattCharacteristic1;
  }

  public async read(): Promise<Buffer> {}

  public async write(value: Buffer, withoutResponse: boolean): Promise<void> {}

  public async notify(notify: boolean): Promise<boolean> {}
}
