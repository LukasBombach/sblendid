declare module "dbus" {
  export type busType = "system";
  export type ServiceName = "org.bluez";
  export type InterfaceName = "org.bluez.Adapter1";
  interface Adapter1Events {}
  interface Adapter1Properties {}

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<I extends InterfaceName>(
      serviceName: ServiceName,
      objectPath: string,
      interfaceName: I,
      callback: (err: Error, value: DBusInterfaces[ServiceName][I]) => void
    ): void;
    disconnect(): void;
  }

  export type ExtractFunctions<T> = {
    [K in keyof T]: T[K] extends AnyFunction ? T[K] : never;
  };

  export type OmitDefaultMethods<T> = Omit<
    T,
    "on" | "off" | "getProperty" | "object"
  >;

  export type InterfaceMethod<
    K extends keyof DBusInterfaces[ServiceName]
  > = OmitDefaultMethods<ExtractFunctions<DBusInterfaces[ServiceName][K]>>;

  interface DBusInterfaces {
    "org.bluez": {
      "org.bluez.Adapter1": {
        on: <K extends keyof Adapter1Events>(
          name: K,
          listener: (value: Adapter1Events[K]) => void
        ) => void;
        off: <K extends keyof Adapter1Events>(
          name: K,
          listener: (value: Adapter1Events[K]) => void
        ) => void;
        getProperty: <K extends keyof Adapter1Properties>(
          name: K,
          callback: (err: Error, value: Adapter1Properties[K]) => void
        ) => void;

        object: {
          method: Record<keyof InterfaceMethod<"org.bluez.Adapter1">, unknown>;
        };

        StartDiscovery(cb: (err: Error) => void): void;
        StopDiscovery(cb: (err: Error) => void): void;
      };
    };
  }
}
