import { Characteristic } from "../adapter";
import { GattService1 } from "./objectManager";
import SystemBus from "./systemBus";
import List from "./list";

type CallbackWithValue = (error: Error | null, value: any) => void;

interface GattService1Methods {
  getProperty: (name: string, callback: CallbackWithValue) => void;
}

export default class Service {
  private static services = new List<Service>();
  public readonly gattService1: GattService1;
  public readonly path: string;
  public readonly uuid: SUUID;
  private systemBus = new SystemBus();
  private dbusInterface?: GattService1Methods;

  static add(service: Service): void {
    Service.services.add(service);
  }

  static find(path: string, sUUID: SUUID): Service | undefined {
    return Service.services.find(s => s.path === path && s.uuid === sUUID);
  }

  static findAll(path: string): Service[] {
    return Service.services.findAll(s => s.path === path);
  }

  constructor(gattService1: GattService1) {
    this.gattService1 = gattService1;
    this.path = gattService1.Device;
    this.uuid = gattService1.UUID;
  }

  public async getCharacteristics(): Promise<Characteristic[]> {}

  private async getDBusInterface(): Promise<GattService1Methods> {
    if (!this.dbusInterface) {
      this.dbusInterface = await this.fetchDBusInterface();
    }
    return this.dbusInterface;
  }

  private fetchDBusInterface(): Promise<GattService1Methods> {
    const service = "org.bluez";
    const path = this.path;
    const name = "org.bluez.GattService1";
    return this.systemBus.getInterface({ service, path, name }) as any; // todo unlawful typecast
  }
}
