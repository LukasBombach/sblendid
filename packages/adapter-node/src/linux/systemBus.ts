import { promisify } from "util";
import DBus from "dbus";
import type { Props, Methods, Events, EventMethod } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  public async getInterface<
    P extends Props = {},
    M extends Methods = {},
    E extends Events = {}
  >(service: string, path: string, name: string) {
    const getMethod = (n: keyof M) => promisify(iface[n].bind(iface));
    const iface = await getInterface<P, M, E>(service, path, name);
    const on: EventMethod<E> = (event, listener) => iface.on(event, listener);
    const off: EventMethod<E> = (event, listener) => iface.off(event, listener);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = this.getMethods(iface);
    const api = { on, off, getProperty, ...methods };
    return api;
  }

  private getMethods<
    P extends Props = {},
    M extends Methods = {},
    E extends Events = {}
  >(iface: DBus.DBusInterface<P, M, E>): M {
    const methods = {} as M;
    const methodNames: (keyof M)[] = Object.keys(iface.object.method);
    methodNames.forEach((n) => (methods[n] = this.getMethod(iface, n)));
    return methods;
  }

  // todo bad typecasting here because Methods in DBusInterface is typed wrong
  private getMethod<
    N extends keyof M,
    P extends Props = {},
    M extends Methods = {},
    E extends Events = {}
  >(iface: DBus.DBusInterface<P, M, E>, name: N): M[N] {
    return promisify(iface[name].bind(iface)) as M[N];
  }
}
