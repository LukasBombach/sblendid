import { GattService1 } from "../../types/bluez";
import List from "../list";

export default class Service {
  private static services = new List<Service>();
  public readonly uuid: SUUID;
  public readonly path: string;
  public readonly gattService1: GattService1;

  static add(service: Service): void {
    Service.services.add(service);
  }

  static find(sUUID: SUUID): Service | undefined {
    return Service.services.find(s => s.uuid === sUUID);
  }

  constructor(path: string, gattService1: GattService1) {
    this.uuid = gattService1.UUID;
    this.path = path;
    this.gattService1 = gattService1;
  }
}
