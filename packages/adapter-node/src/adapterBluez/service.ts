import { GattService1 } from "./objectManager";

export default class Service {
  private gattService1: GattService1;

  constructor(gattService1: GattService1) {
    this.gattService1 = gattService1;
  }
}
