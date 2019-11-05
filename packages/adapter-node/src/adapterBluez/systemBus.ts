import DBus, { DBusInterface } from "dbus";

export interface InterfaceParams {
  service: string;
  path: string;
  name: string;
}

export default class SystemBus {
  private static bus = DBus.getBus("system");

  public async getInterface<T = any>(params: InterfaceParams): Promise<T> {
    const dbusInterface = await this.fetchInterface(params);
    return dbusInterface as any;
  }

  private fetchInterface(params: InterfaceParams): Promise<DBusInterface> {
    return new Promise((resolve, reject) => {
      const { service, path, name } = params;
      SystemBus.bus.getInterface(service, path, name, (error, iface) => {
        return error
          ? reject(new Error(`${error.message}: ${service} ${path} ${name}`))
          : resolve(iface);
      });
    });
  }
}
