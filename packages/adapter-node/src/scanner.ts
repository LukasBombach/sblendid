import Adapter from "./adapter";
import { PeripheralProps } from "./peripheral";
import Bindings from "./types/bindings";

export type FindCondition = () => boolean;

export default class Scanner {
  private adapter: Adapter;
  private bindings: Bindings;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
    this.bindings = adapter.bindings;
  }

  public async find(condition: FindCondition): Promise<PeripheralProps> {
    return await this.adapter.run<"discover", PeripheralProps>(
      () => this.bindings.startScanning(),
      () => this.adapter.when("discover", condition),
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
