import Bindings from "./bindings";
import Queue from "./queue";
import { Event, Params, Listener, Promish } from "./types/bindings";

export type Action = () => Promish<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type Post<E extends Event, ReturnValue = Params<E>> = (
  params: Params<E>
) => Promish<ReturnValue | void>;

export default class Adapter {
  private bindings = new Bindings();

  public on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promish<void | boolean> {
    return this.bindings.on(event, listener);
  }

  public off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promish<void | boolean> {
    return this.bindings.off(event, listener);
  }

  public async read(
    peripheralUUID: string,
    ServiceUUID: BluetoothServiceUUID,
    CharacteristicUUID: BluetoothCharacteristicUUID
  ): Promise<Buffer> {
    const isThis = this.isThis(peripheralUUID, ServiceUUID, CharacteristicUUID);
    return await this.run<"read", Buffer>(
      () => this.bindings.read(peripheralUUID, ServiceUUID, CharacteristicUUID),
      () => this.when("read", (p, s, c) => isThis(p, s, c)),
      ([, , , buffer]) => buffer
    );
  }

  public async write(
    peripheralUUID: string,
    ServiceUUID: BluetoothServiceUUID,
    CharacteristicUUID: BluetoothCharacteristicUUID,
    value: Buffer,
    withoutResponse = false
  ): Promise<void> {
    const isThis = this.isThis(peripheralUUID, ServiceUUID, CharacteristicUUID);
    await this.run<"write">(
      () =>
        this.bindings.write(
          peripheralUUID,
          ServiceUUID,
          CharacteristicUUID,
          value,
          withoutResponse
        ),
      () => this.when("write", (p, s, c) => isThis(p, s, c))
    );
  }

  public async notify(
    peripheralUUID: string,
    ServiceUUID: BluetoothServiceUUID,
    CharacteristicUUID: BluetoothCharacteristicUUID,
    notify: boolean
  ): Promise<boolean> {
    const isThis = this.isThis(peripheralUUID, ServiceUUID, CharacteristicUUID);
    return await this.run<"notify", boolean>(
      () =>
        this.bindings.notify(
          peripheralUUID,
          ServiceUUID,
          CharacteristicUUID,
          notify
        ),
      () => this.when("notify", (p, s, c) => isThis(p, s, c)),
      ([, , , state]) => state
    );
  }

  private isThis(...originalValues: any[]): (...values: any[]) => boolean {
    return (...values: any[]) =>
      originalValues.every((v, i) => v === values[i]);
  }

  private async run<E extends Event, ReturnValue = Params<E>>(
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

  private when<E extends Event>(
    event: E,
    condition: Listener<E>
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
