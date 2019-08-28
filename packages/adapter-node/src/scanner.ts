import Bindings from "./bindings";
import { PeripheralProps } from "./peripheral";

export type FindCondition = () => boolean;

export default class Scanner {
  private bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public async find(condition: FindCondition): Promise<PeripheralProps> {
    return await this.bindings.run<"discover", PeripheralProps>(
      () => this.bindings.startScanning(),
      () => this.bindings.when("discover", condition),
      () => this.bindings.stopScanning(),
      ([
        uuid,
        address,
        addressType,
        connectable,
        advertisement = {},
        rssi
      ]) => ({
        uuid,
        address,
        addressType,
        connectable,
        advertisement,
        rssi
      })
    );
  }
}
