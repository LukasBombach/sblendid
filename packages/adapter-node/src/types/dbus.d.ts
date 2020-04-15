declare module "dbus" {
  export type busType = "session" | "system";
  export function getBus(type: busType): DBusConnection;
  export interface DBusConnection {
    getInterface(
      serviceName: string,
      objectPath: string,
      interfaceName: string,
      callback: (err: Error, iface: DBusInterface) => void
    ): void;
    disconnect(): void;
  }

  interface OriginalDBusInterface {
    getProperty(
      name: string,
      callback: (err: Error, name: string) => void
    ): void;
    setProperty(name: string, value: any, callback: (err: Error) => void): void;
    getProperties(
      callback: (err: Error, properties: Array<{ [name: string]: any }>) => void
    ): void;
    [methodName: string]: (...args: any[]) => void;
  }

  export type DBusInterface = OriginalDBusInterface & {
    object: {
      method: Record<string, any>;
    };
  };
}
