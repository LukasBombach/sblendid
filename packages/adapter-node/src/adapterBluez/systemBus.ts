import DBus, { DBusInterface } from "dbus";

export interface InterfaceParams {
  service: string;
  path: string;
  name: string;
}

export default class SystemBus {
  private static bus = DBus.getBus("system");

  public getInterface<T = DBusInterface>(params: InterfaceParams): Promise<T> {
    const { service, path, name } = params;
    return new Promise((resolve, reject) => {
      SystemBus.bus.getInterface(service, path, name, (error, iface) => {
        return error
          ? reject(new Error(`${error.message}: ${service} ${path} ${name}`))
          : resolve(iface as any); // todo unlawful any
      });
    });
  }
}
