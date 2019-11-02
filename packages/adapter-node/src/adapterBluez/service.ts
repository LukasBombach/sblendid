import { GattService1 } from "./objectManager";
import List from "./list";

export default class Service {
  private static services = new List<Service>();
  public readonly gattService1: GattService1;
  public readonly path: string;
  public readonly uuid: SUUID;

  static add(service: Service): void {
    Service.services.add(service);
  }

  static findAll(path: string): Service[] {
    return Service.services.findAll(s => s.path === path);
  }

  constructor(gattService1: GattService1) {
    this.gattService1 = gattService1;
    this.path = gattService1.Device;
    this.uuid = gattService1.UUID;
  }
}
