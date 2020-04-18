declare module "dbus" {
  export type busType = "session" | "system";
  export type Callback<V> = (err: Error, value: V) => void;
  export type Methods = Record<string, (...args: any[]) => void>;
  export type Events = Record<string, any[]>;

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<P, M extends Methods, E extends Events>(
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
    E extends Events = {}
  > = {
    object: {
      method: Record<keyof M, unknown>;
    };
    getProperty: <K extends keyof P>(name: K, callback: Callback<P[K]>) => void;
    on: EventHandler<E>;
    off: EventHandler<E>;
  } & M;
}
