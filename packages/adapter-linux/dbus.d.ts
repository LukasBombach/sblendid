declare module "dbus" {
  export type busType = "system";
  export type ServiceName = "org.bluez";

  type AnyFunction = (...args: any[]) => any;

  export type BluezInterfaces = {
    "org.bluez.Adapter1": {
      path: "/org/bluez/hci0";
      name: "org.bluez.Adapter1";
      methods: {
        StartDiscovery(cb: (err: Error) => void): void;
        StopDiscovery(cb: (err: Error) => void): void;
      };
    };
    "org.freedesktop.DBus.ObjectManager": {
      path: "/";
      name: "org.freedesktop.DBus.ObjectManager";
      events: {
        InterfacesAdded: (path: string, interfaces: BluezInterfaces) => void;
      };
      methods: {};
    };
  };

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<I extends keyof BluezInterfaces>(
      service: ServiceName,
      path: string,
      name: I,
      callback: (err: Error, value: DBusInterface<BluezInterfaces[I]>) => void
    ): void;
    disconnect(): void;
  }

  type EventApi<I> = I extends { events: Record<string, AnyFunction> }
    ? {
        on: <K extends keyof I["events"]>(
          name: K,
          listener: (value: I["events"][K]) => void
        ) => void;
        off: <K extends keyof I["events"]>(
          name: K,
          listener: (value: I["events"][K]) => void
        ) => void;
      }
    : {
        on: (name: never, listener: never) => void;
        off: (name: never, listener: never) => void;
      };

  type PropertiesApi<I> = I extends { properties: Record<string, any> }
    ? {
        getProperty: <K extends keyof I["properties"]>(
          name: K,
          callback: (err: Error, value: I["properties"][K]) => void
        ) => void;
      }
    : {
        getProperty: (
          name: never,
          callback: (err: never, value: never) => void
        ) => void;
      };

  type MethodsApi<I> = I extends { methods: Record<string, AnyFunction> }
    ? {
        object: {
          method: Record<keyof I["methods"], unknown>;
        };
      } & I["methods"]
    : {
        object: {
          method: {};
        };
      };

  type DBusInterface<I> = EventApi<I> & PropertiesApi<I> & MethodsApi<I>;

  /* interface DBusInterfaces {
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
  } */

  /* export type ExtractFunctions<T> = {
    [K in keyof T]: T[K] extends AnyFunction ? T[K] : never;
  };

  export type OmitDefaultMethods<T> = Omit<
    T,
    "on" | "off" | "getProperty" | "object"
  >;

  export type InterfaceMethod<
    K extends keyof DBusInterfaces[ServiceName]
  > = OmitDefaultMethods<ExtractFunctions<DBusInterfaces[ServiceName][K]>>; */
}
