import Bindings, { Event, Listener, Params } from "./types/bindings";
import NativeBindings from "./native";
import Queue from "../src/queue";

export type Action = () => Promish<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type Post<E extends Event, ReturnValue = Params<E>> = (
  params: Params<E>
) => Promish<ReturnValue | void>;
export type WhenCondition<E extends Event> = (
  ...params: Params<E>
) => Promish<boolean>;

export default class Adapter {
  private bindings: Bindings = new NativeBindings();

  init(): void {
    this.bindings.init();
  }

  stop(): void {
    this.bindings.stop();
  }

  startScanning(
    serviceUuids?: BluetoothServiceUUID[],
    allowDuplicates?: boolean
  ): void {
    this.bindings.startScanning(serviceUuids, allowDuplicates);
  }

  stopScanning(): void {
    this.bindings.stopScanning();
  }

  connect(peripheralUuid: string): void {
    this.bindings.connect(peripheralUuid);
  }

  disconnect(peripheralUuid: string): void {
    this.bindings.disconnect(peripheralUuid);
  }

  updateRssi(peripheralUuid: string): void {
    this.bindings.updateRssi(peripheralUuid);
  }

  discoverServices(
    peripheralUuid: string,
    serviceUuids: BluetoothServiceUUID[]
  ): void {
    this.bindings.discoverServices(peripheralUuid, serviceUuids);
  }

  discoverIncludedServices(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    serviceUuids: BluetoothServiceUUID[]
  ): void {
    this.bindings.discoverIncludedServices(
      peripheralUuid,
      serviceUuid,
      serviceUuids
    );
  }

  discoverCharacteristics(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuids: BluetoothCharacteristicUUID[]
  ): void {
    this.bindings.discoverCharacteristics(
      peripheralUuid,
      serviceUuid,
      characteristicUuids
    );
  }

  read(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void {
    this.bindings.read(peripheralUuid, serviceUuid, characteristicUuid);
  }

  write(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    data: Buffer,
    withoutResponse: boolean
  ): void {
    this.bindings.write(
      peripheralUuid,
      serviceUuid,
      characteristicUuid,
      data,
      withoutResponse
    );
  }

  broadcast(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    broadcast: boolean
  ): void {
    this.bindings.broadcast(
      peripheralUuid,
      serviceUuid,
      characteristicUuid,
      broadcast
    );
  }

  notify(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    notify: boolean
  ): void {
    this.bindings.notify(
      peripheralUuid,
      serviceUuid,
      characteristicUuid,
      notify
    );
  }

  discoverDescriptors(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID
  ): void {
    this.bindings.discoverDescriptors(
      peripheralUuid,
      serviceUuid,
      characteristicUuid
    );
  }

  readValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID
  ): void {
    this.bindings.readValue(
      peripheralUuid,
      serviceUuid,
      characteristicUuid,
      descriptorUuid
    );
  }

  writeValue(
    peripheralUuid: string,
    serviceUuid: BluetoothServiceUUID,
    characteristicUuid: BluetoothCharacteristicUUID,
    descriptorUuid: BluetoothDescriptorUUID,
    data: Buffer
  ): void {
    this.bindings.writeValue(
      peripheralUuid,
      serviceUuid,
      characteristicUuid,
      descriptorUuid,
      data
    );
  }

  readHandle(peripheralUuid: string, handle: number): void {
    this.bindings.readHandle(peripheralUuid, handle);
  }

  writeHandle(
    peripheralUuid: string,
    handle: number,
    data: Buffer,
    withoutResponse: boolean
  ): void {
    this.bindings.writeHandle(peripheralUuid, handle, data, withoutResponse);
  }

  on<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.on(event, listener);
  }

  off<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.off(event, listener);
  }

  once<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.once(event, listener);
  }

  async run<E extends Event, ReturnValue = Params<E>>(
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
