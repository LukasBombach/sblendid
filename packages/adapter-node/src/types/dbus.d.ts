declare module "dbus" {
  export type busType = "session" | "system";
  export type Callback<V> = (err: Error, value: V) => void;
  export type Methods = Record<string, (...args: any[]) => void>;

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<P, M extends Methods, E>(
      serviceName: string,
      objectPath: string,
      interfaceName: string,
      callback: Callback<DBusInterface<P, M, E>>
    ): void;
    disconnect(): void;
  }

  export type DBusInterface<
    P extends {} = {},
    M extends Methods = {},
    E extends {} = {}
  > = {
    object: {
      method: Record<keyof M, unknown>;
    };
    getProperty: <K extends keyof P>(name: K, callback: Callback<P[K]>) => void;
    on: <K extends keyof E>(name: K, listener: Callback<E[K]>) => void;
    off: <K extends keyof E>(name: K, listener: Callback<E[K]>) => void;
  } & M;
}
