import Bindings from "./bindings";

export default class Adapter {
  private bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public async powerOn(): Promise<void> {
    await this.bindings.run(
      () => this.bindings.init(),
      () => this.bindings.when("stateChange", state => state === "poweredOn")
    );
  }

  public async powerOff(): Promise<void> {
    this.bindings.stop();
  }
}
