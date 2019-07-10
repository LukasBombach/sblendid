import Adapter from "./adapter";
import Device from "./device";

export default class Sblendid {
  static async connect(
    name: string,
    optionalServices?: BluetoothServiceUUID[]
  ): Promise<Device> {
    const adapter = new Adapter();
    const filters = [{ name }];
    const options = { filters, optionalServices };
    await adapter.powerOn();
  }
}
