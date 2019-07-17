import Bindings, { Events, EventName, EventListener, EventParameters, State } from "../../sblendid/types/bindings";
import Peripheral from "../../sblendid/src/peripheral";

export interface EventOptions {
  map?: boolean;
}

export type MappedListener<E extends EventName> = (ReturnType<>);

type ListenerMappers = Record<EventName, Function>

export default class Adapter extends Bindings {
  private m: Record<EventName, Function> = {
    discover: (...p: EventParameters<"discover">) => new Peripheral(this, ...p),
  };

  on<E extends EventName>(event: E, listener: EventListener<E>): void;
  on<E extends EventName>(event: E, listener: MappedListener, options: EventOptions): void;
  on<E extends EventName>(
    event: E,
    listener: EventListener<E> | MappedListener,
    options?: EventOptions
  ): void {
    if (options && options.map) {
      const lowLevelListener = (...args: EventParameters<E>) => {
        listener as MappedListener(this.m[event](...args));
      };
      super.on(event, lowLevelListener);
    } else {
      super.on(event, listener as EventListener<E>);
    }
  }
}
