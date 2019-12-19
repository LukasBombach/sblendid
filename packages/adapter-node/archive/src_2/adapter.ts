/// <reference path="./types/global.d.ts" />
import { Event, Params, Listener } from "./types/nobleAdapter";
import Queue from "./queue";

export type FindCondition = (
  ...discoverParams: Params<"discover">
) => Promish<boolean>;

export interface Properties {
  read: boolean;
  write: boolean;
  notify: boolean;
}

export interface Characteristic {
  uuid: CUUID;
  properties: Properties;
}

export type Action = () => Promish<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type Post<E extends Event, ReturnValue = Params<E>> = (
  params: Params<E>
) => Promish<ReturnValue | void>;
export type WhenCondition<E extends Event> = (
  ...params: Params<E>
) => Promish<boolean>;

export default abstract class Adapter {
  public abstract init(): Promise<void>;

  public abstract startScanning(): Promise<void>;

  public abstract stopScanning(): Promise<void>;

  public abstract find(condition: FindCondition): Promise<Params<"discover">>;

  public abstract connect(pUUID: PUUID): Promise<void>;

  public abstract disconnect(pUUID: PUUID): Promise<void>;

  public abstract getRssi(pUUID: PUUID): Promise<number>;

  public abstract getServices(pUUID: PUUID): Promise<SUUID[]>;

  public abstract getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]>;

  public abstract read(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID
  ): Promise<Buffer>;

  public abstract write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void>;

  public abstract notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean>;

  public abstract on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void>;

  public abstract off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void>;

  protected async run<E extends Event, ReturnValue = Params<E>>(
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
  }

  protected when<E extends Event>(
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
