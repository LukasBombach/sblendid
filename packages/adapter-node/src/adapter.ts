import Bindings from "./bindings";

const POWEREDON = "poweredOn";

export default class Adapter {
  private static bindings = Bindings.getInstance();
  private static state?: string;

  public static async powerOn(): Promise<void> {
    if (Adapter.state === POWEREDON) return;
    await Adapter.bindings.run(
      () => Adapter.bindings.init(),
      () => Adapter.bindings.when("stateChange", state => state === POWEREDON)
    );
    Adapter.state = POWEREDON;
  }

  public static async powerOff(): Promise<void> {
    if (Adapter.state !== POWEREDON) return;
    Adapter.bindings.stop();
    Adapter.state = undefined;
  }
}
