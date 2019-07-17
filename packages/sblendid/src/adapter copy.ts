import { inherits } from "util";
import promisedEvent from "p-event";
import Bindings, {
  Events,
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "../types/bindings";
import Peripheral from "./peripheral";

export type Action = () => void | Promise<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type End = () => void | Promise<void>;
export type Condition<E extends Event> = Listener<E> | Params<E> | Params<E>[0];

export type DiscoverListener = (peripheral: Peripheral) => Promise<void> | void;

type ListenerMap = Map<Function, Listener<Event>>;

// const mapEventToPeripheral = (...p: DiscoverParams) => new Peripheral(this.adapter, ...p);

interface MappedListeners {
  discover: (peripheral: Peripheral) => Promise<void> | void;
}

interface EventMappers {
  discover: (...p: Params<"discover">) => Peripheral;
}

type AnyListener<E extends Event> = Listener<E> | MappedListener<E>;

type MappedFunction = Function; // Type "Function"
export type EventOptions = EventOptionsObject | MappedFunction;
export interface EventOptionsObject {
  map?: MappedFunction | boolean;
}

export default class Adapter extends Bindings {
  private listenerMap: ListenerMap = new Map();

  private eventMappers: EventMappers = {
    discover: (...p: Params<"discover">) => new Peripheral(this, ...p)
  };

  private constructor() {
    super();
  }

  public static withBindings(bindings: Bindings): Bindings & Adapter {
    class BoundAdapter {}
    inherits(BoundAdapter, bindings.constructor);
    inherits(BoundAdapter, Adapter);
    return new BoundAdapter() as Bindings & Adapter;
  }

  // todo bad typecast
  on<E extends Event>(event: E, listener: Listener<E>): void;
  on<E extends Event>(event: E, listener: Listener<E>, options: EventOptions): void;
  on<E extends Event>(event: E, listener: Listener<E>, options?: EventOptions): void {
    const mapFunction = this.getMapFunction(event, options);
    if (!mapFunction) return super.on(event, listener);
    if (this.listenerMap.get(mapFunction)) return;
    const lowLevelListener = ((...args: Params<E>) => mapFunction(...args)) as Events[E];
    this.listenerMap.set(mapFunction, lowLevelListener);
    super.on<E>(event, lowLevelListener);
  }

  // todo bad typecast
  once<E extends Event>(event: E, listener: Listener<E>, options?: EventOptions): void {
    const mapFunction = this.getMapFunction(event, options);
    if (!mapFunction) return super.on(event, listener);
    if (this.listenerMap.get(mapFunction)) return;
    const lowLevelListener = ((...args: Params<E>) => mapFunction(...args)) as Events[E];
    this.listenerMap.set(mapFunction, lowLevelListener);
    super.once<E>(event, lowLevelListener);
  }

  // todo bad typecast
  off<E extends Event>(event: E, listener: Listener<E>, options?: EventOptions): void {
    const mapFunction = this.getMapFunction(event, options);
    if (!mapFunction) return super.on(event, listener);
    const lowLevelListener = this.listenerMap.get(mapFunction) as Events[E];
    if (lowLevelListener) this.listenerMap.delete(mapFunction);
    super.off<E>(event, lowLevelListener);
  }

  async run<E extends Event>(action: Action, when: When<E>, end?: End): Promise<Params<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  // todo fucking any, same reason as for the typecast above
  public when<E extends Event>(event: E, filter?: Condition<E>): Promise<Params<E>> {
    return promisedEvent<E, Params<E>>(this as any, event, { filter, multiArgs: true } as any);
  }

  // todo this should return the low level listener as well
  private getMapFunction(event: Event, options?: EventOptions): MappedFunction | undefined {
    if (typeof options === "undefined") return undefined;
    if (typeof options === "function") return options;
    if (typeof options.map === "function") return options.map;
    if (options.map === true) return this.eventMaps[event];
    return;
  }
}
