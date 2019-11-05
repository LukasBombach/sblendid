import { GattCharacteristic1 } from "./objectManager";
import SystemBus from "./systemBus";
import List from "./list";

type CallbackWithValue = (error: Error | null, value: any) => void;

interface GattCharacteristic1Methods {
  getProperty: (name: string, callback: CallbackWithValue) => void;
}

export default class Characteristic {
  private static services = new List<Characteristic>();
  private systemBus = new SystemBus();
  public readonly gattCharacteristic1: GattCharacteristic1;
  private dbusInterface?: GattCharacteristic1Methods;

  static add(service: Characteristic): void {
    Characteristic.services.add(service);
  }

  static findAll(path: string): Characteristic[] {
    return Characteristic.services.findAll(s => s.path === path);
  }

  constructor(gattCharacteristic1: GattCharacteristic1) {
    this.gattCharacteristic1 = gattCharacteristic1;
  }

  private async getDBusInterface(): Promise<GattCharacteristic1Methods> {
    if (!this.dbusInterface) {
      this.dbusInterface = await this.fetchDBusInterface();
    }
    return this.dbusInterface;
  }

  private fetchDBusInterface(): Promise<GattCharacteristic1Methods> {
    const service = "org.bluez";
    const path = this.path;
    const name = "org.bluez.GattCharacteristic1";
    return this.systemBus.getInterface({ service, path, name }) as any; // todo unlawful typecast
  }
}
