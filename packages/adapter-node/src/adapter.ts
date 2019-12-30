import Bindings from "./bindings";

const INIT = "init";
const POWERED_ON = "poweredOn";
const POWERED_OFF = "powered_Off";

export default class Adapter {
  private static bindings = Bindings.getInstance();
  private static state: string = POWERED_OFF;

  public static async powerOn(): Promise<void> {
    if (Adapter.state !== POWERED_OFF) return;
    Adapter.state = INIT;
    await Adapter.bindings.run(
      () => Adapter.bindings.init(),
      () => Adapter.bindings.when("stateChange", state => state === POWERED_ON)
    );
    Adapter.state = POWERED_ON;
  }

  public static async powerOff(): Promise<void> {
    if (Adapter.state !== POWERED_ON) return;
    Adapter.bindings.stop();
    Adapter.state = POWERED_OFF;
  }
}
