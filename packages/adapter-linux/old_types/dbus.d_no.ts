declare module "dbus" {
  export type busType = "system";
  export type ServiceName = "org.bluez";

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<I extends keyof DBusBluezInterfaces>(
      service: ServiceName,
      path: string,
      name: I,
      callback: (err: Error | null, value: DBusBluezInterfaces[I]) => void
    ): void;
    disconnect(): void;
  }

  export interface DBusInterfaces {
    "org.bluez": DBusBluezInterfaces;
  }

  export interface DBusBluezInterfaces {
    "org.bluez.Adapter1": {
      on: (name: never, listener: never) => void;
      off: (name: never, listener: never) => void;
      getProperty: (name: never, callback: never) => void;
      object: {
        method: Record<keyof Methods<"org.bluez.Adapter1">, unknown>;
      };
      StartDiscovery: (cb: (err: Error | null) => void) => void;
      StopDiscovery: (cb: (err: Error | null) => void) => void;
    };
    "org.freedesktop.DBus.ObjectManager": {
      on: <K extends keyof Events["ObjectManager"]>(
        name: K,
        listener: Events["ObjectManager"][K]
      ) => void;
      off: <K extends keyof Events["ObjectManager"]>(
        name: K,
        listener: Events["ObjectManager"][K]
      ) => void;
      getProperty: (name: never, callback: never) => void;
      object: {
        method: Record<
          keyof Methods<"org.freedesktop.DBus.ObjectManager">,
          unknown
        >;
      };
      GetManagedObjects: (
        cb: (err: Error | null, managedObjects: ManagedObjects) => void
      ) => void;
    };
  }

  export interface Events {
    ObjectManager: {
      InterfacesAdded: (path: string, interfaces: BluezInterfaces) => void;
    };
  }

  export type Methods<K extends keyof DBusBluezInterfaces> = Omit<
    DBusBluezInterfaces[K],
    "on" | "off" | "getProperty" | "object"
  >;

  export type ManagedObjects = Record<string, Record<string, BluezInterfaces>>;
}
