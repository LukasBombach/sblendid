import Bindings, { Event, Params, Listener } from "./types/bindings";
import BindingsHelper from "./bingings";

export type Action = () => Promish<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type Post<E extends Event, ReturnValue = Params<E>> = (
  params: Params<E>
) => Promish<ReturnValue | void>;

export default class Adapter {
  public bindingsHelper: BindingsHelper;

  constructor(bindingsHelper: BindingsHelper) {
    this.bindingsHelper = bindingsHelper;
  }

  public async powerOn(): Promise<void> {
    await this.bindingsHelper.run(
      () => this.bindingsHelper.bindings.init(),
      () =>
        this.bindingsHelper.when("stateChange", state => state === "poweredOn")
    );
  }
}
