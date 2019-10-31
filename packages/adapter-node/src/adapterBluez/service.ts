import { GattService1 } from "./objectManager";
import List from "./list";

export default class Service {
  private static services = new List<Service>();
  private gattService1: GattService1;

  static add(device: Service): void {
    Service.services.add(device);
  }

  constructor(gattService1: GattService1) {
    this.gattService1 = gattService1;
  }
}
