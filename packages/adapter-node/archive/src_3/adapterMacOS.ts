import path from "path";
import { EventEmitter } from "events";
import { inherits } from "util";
import Adapter, { FindCondition, Characteristic } from "./adapter";
import { Event, Params, Listener } from "./types/nobleAdapter";

import NobleBindings from "../src/types/bindings";
const nativePath = path.resolve(__dirname, "../native/noble_mac.node");
const NobleMac = require(nativePath).NobleMac;
inherits(NobleMac, EventEmitter);

type SubType<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
}[keyof Base];

type NobleMethod = SubType<NobleBindings, Function>;

export default class MacOSAdapter extends Adapter {
  private bindings: NobleBindings = new NobleMac();

  public async init(): Promise<void> {
    await this.run("init", [], "stateChange", ["poweredOn"]);
  }

  public async startScanning(): Promise<void> {
    this.bindings.startScanning();
  }

  public stopScanning(): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public find(condition: FindCondition): Promise<Params<"discover">> {
    throw new Error("Not implemented yet");
  }

  public connect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public disconnect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet");
  }

  public getServices(pUUID: PUUID): Promise<SUUID[]> {
    throw new Error("Not implemented yet");
  }

  public getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    throw new Error("Not implemented yet");
  }

  public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    throw new Error("Not implemented yet");
  }

  public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    throw new Error("Not implemented yet");
  }

  public on<E extends Event>(event: E, listener: Listener<E>): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public off<E extends Event>(event: E, listener: Listener<E>): Promise<void> {
    throw new Error("Not implemented yet");
  }

  /* async run<E extends Event, ReturnValue = Params<E>>(
    action: Action,
    when: When<E>,
    ...posts: Post<E, ReturnValue>[]
  ): Promise<ReturnValue> {
    const [params] = await Promise.all([when(), action()]);
    const cleanupMethods = posts.slice(0, -1);
    const returnMethod = posts.slice(-1).pop();
    for (const post of cleanupMethods) await post(params);
    const returnMethodValue = returnMethod && (await returnMethod(params));
    return (typeof returnMethodValue !== "undefined"
      ? returnMethodValue
      : params) as ReturnValue;
  } */

  private async run<M extends NobleMethod>(
    method: M,
    params: Parameters<NobleBindings[M]>,
    event: Event,
    condition: any[]
  ): Promise<void> {
    const listener = (...params: any[]) => this.arraysEqual(params, condition);
    this.bindings.on(event, listener);
    const [params] = await Promise.all([when(), action()]);
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    return a.every((v, i) => v === b[i]);
  }

  public when<E extends Event>(
    event: E,
    condition: WhenCondition<E>
  ): Promise<Params<E>> {
    return new Promise<Params<E>>(resolve => {
      const queue = new Queue();
      const listener = async (...params: Params<E>) => {
        const conditionIsMet = await queue.add(() => condition(...params));
        if (conditionIsMet) await queue.end(() => resolve(params));
        if (conditionIsMet) this.off(event, listener);
      };
      this.on(event, listener);
    });
  }
}
