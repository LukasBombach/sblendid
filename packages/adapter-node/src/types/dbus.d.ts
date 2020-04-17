declare module "dbus" {
  export type busType = "session" | "system";

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<
      P extends Props = {},
      M extends Methods = {},
      E extends Events = {}
    >(
      serviceName: string,
      objectPath: string,
      interfaceName: string,
      callback: (err: Error, iface: DBusInterface<P, M, E>) => void
    ): void;
    disconnect(): void;
  }

  export type Props = Record<string, any>;
  export type Methods = Record<string, Method>;
  export type Events = Record<string, any[]>;

  export type Method<T extends any[] = [], TResult = void> = (
    ...args: T
  ) => Promise<TResult>;

  /* type Method = Method0 | Method1 | Method2 | Method3;

  type Method0<TResult = any> = (
    callback: (err: Error, result: TResult) => void
  ) => void;

  type Method1<T1 extends any = any, TResult = any> = (
    arg1: T1,
    callback: (err: Error, result: TResult) => void
  ) => void;

  type Method2<T1 extends any = any, T2 extends any = any, TResult = any> = (
    arg1: T1,
    arg2: T2,
    callback: (err: Error, result: TResult) => void
  ) => void;

  type Method3<
    T1 extends any = any,
    T2 extends any = any,
    T3 extends any = any,
    TResult = any
  > = (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    callback: (err: Error, result: TResult) => void
  ) => void; */

  export type EventMethod<E extends Events> = <K extends keyof E>(
    event: K,
    listener: (...args: E[K]) => Promish<void>
  ) => void;

  export type DBusInterface<
    P extends Props = {},
    M extends Methods = {},
    E extends Events = {}
  > = {
    getProperty<K extends keyof P>(
      name: K,
      callback: (err: Error, name: P[K]) => void
    ): void;
    setProperty<K extends keyof P>(
      name: K,
      value: P[K],
      callback: (err: Error) => void
    ): void;
    getProperties(callback: (err: Error, properties: P) => void): void;
    object: {
      method: Record<keyof M, any>;
    };
    on: EventMethod<E>;
    off: EventMethod<E>;
  } & M;
}
