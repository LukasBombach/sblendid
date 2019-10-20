import DBus, { DBusInterface } from "dbus";

export default class SystemBus {
  private bus = DBus.getBus("system");

  public getInterface<T = DBusInterface>(
    serviceName: string,
    objectPath: string,
    interfaceName: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.bus.getInterface(
        serviceName,
        objectPath,
        interfaceName,
        (err, iface) => (err ? reject(err) : resolve(iface))
      );
    });
  }
}
