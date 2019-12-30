import Bindings from "./bindings";
import { Params } from "./types/bindings";

export type FindCondition = (
  ...discoverParams: Params<"discover">
) => Promish<boolean>;

export default class Scanner {
  private bindings = Bindings.getInstance();

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    return await this.bindings.run<"discover">(
      () => this.bindings.startScanning(),
      () => this.bindings.when("discover", condition),
      () => this.bindings.stopScanning()
    );
  }
}
