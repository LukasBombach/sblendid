type PUUID = string;
type SUUID = BluetoothServiceUUID;
type CUUID = BluetoothCharacteristicUUID;
type DUUID = BluetoothDescriptorUUID;

type Promish<T> = Promise<T> | T;

type AnyFunction = (...args: any[]) => any;

type Listener<T> = <K extends keyof T>(
  name: K,
  listener: (err: Error, value: T[K]) => void
) => void;

type Unpacked<T> = T extends Promise<infer U> ? U : T;

type PromisifiedFunction<T extends AnyFunction> = T extends () => infer U
  ? () => Promise<Unpacked<U>>
  : T extends (a1: infer A1) => infer U
  ? (a1: A1) => Promise<Unpacked<U>>
  : T extends (a1: infer A1, a2: infer A2) => infer U
  ? (a1: A1, a2: A2) => Promise<Unpacked<U>>
  : T extends (a1: infer A1, a2: infer A2, a3: infer A3) => infer U
  ? (a1: A1, a2: A2, a3: A3) => Promise<Unpacked<U>>
  : T extends (...args: any[]) => infer U
  ? (...args: any[]) => Promise<Unpacked<U>>
  : T;

type Promisified<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? PromisifiedFunction<T[K]> : never;
};
