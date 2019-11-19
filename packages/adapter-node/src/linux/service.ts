import { GattService1 } from "../../types/bluez";
import List from "../list";

export default class Service {
  private static services = new List<Service>();
  public readonly path: string;
  public readonly gattService1: GattService1;

  static add(service: Service): void {
    Service.services.add(service);
  }

  constructor(path: string, gattService1: GattService1) {
    this.path = path;
    this.gattService1 = gattService1;
  }
}
