import { EventEmitter } from "events";
import {
  Bindings,
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "sblendid-bindings-macos";
import Peripheral from "./peripheral";

export interface Converters {
  discover: (...args: Params<"discover">) => Peripheral;
}

export type Converters2 = Record<Event, () => any>;

export interface EventOptions {
  convert: boolean;
}

export type ConvListener<E extends keyof Converters2> = Converters2[E];
export type AnyListener<E extends Event> = Listener<E> | ConvListener<E>;

export default class Adapter {
  private bindings: Bindings;
  private convertEmitter: EventEmitter;

  private converters: Converters = {
    discover: (...args: Params<"discover">) =>
      this.convertEmitter.emit("discover", Peripheral.fromDiscover(this, args))
  };

  constructor(bindings: Bindings = new Bindings()) {
    this.convertEmitter = new EventEmitter();
    this.bindings = bindings;
    this.convertEmitter.on("newListener", this.onNewConvertListener.bind(this));
    this.convertEmitter.on("removeListener", this.onRemoveConvertListener.bind(this));
  }

  public on<E extends Event>(event: E, listener: Listener<E>): void;
  public on<E extends Event>(event: E, listener: ConvListener<E>, options: EventOptions): void;
  public on<E extends Event>(event: E, listener: AnyListener<E>, options?: EventOptions): void {
    if (options && options.convert) {
      this.convertEmitter.on(event, listener);
    } else {
      this.bindings.on(event, listener);
    }
  }

  public off<E extends Event>(event: E, listener: AnyListener<E>): void {
    if (this.convertEmitter.listeners(event).includes(listener)) {
      this.convertEmitter.off(event, listener);
    } else {
      this.bindings.off(event, listener);
    }
  }

  private onNewConvertListener(event: Event): void {
    if (this.convertEmitter.listenerCount(event) > 0) return;
    this.bindings.on(event, this.converters[event]);
  }

  private onRemoveConvertListener(event: Event): void {
    if (this.convertEmitter.listenerCount(event) > 0) return;
    this.bindings.off(event, this.converters[event]);
  }
}
