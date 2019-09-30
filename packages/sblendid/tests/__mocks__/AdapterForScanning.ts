import { EventEmitter } from "events";
import { Event, Listener } from "@sblendid/adapter-node";

export default class AdapterMockForScanning {
  public emitter = new EventEmitter();

  startScanning(...any: []): void {}

  stopScanning(...any: []): void {}

  // todo typecast
  on<E extends Event>(event: E, listener: Listener<E>): void {
    this.emitter.on(event, listener as (...args: any[]) => void);
  }

  // todo typecast
  off<E extends Event>(event: E, listener: Listener<E>): void {
    this.emitter.off(event, listener as (...args: any[]) => void);
  }
}
