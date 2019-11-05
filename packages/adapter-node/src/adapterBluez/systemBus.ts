import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";

export interface InterfaceParams {
  service: string;
  path: string;
  name: string;
}

interface DBusInterfaceObject {
  object: {
    method: Record<string, any>;
  };
}

type FixedDBusInterface = DBusInterface & DBusInterfaceObject;

type PromiseFn = (...args: any[]) => Promise<any>;
type MethodTuple = [string, PromiseFn];

export default class SystemBus {
  private static bus = DBus.getBus("system");

  public async getInterface<M extends Record<string, PromiseFn>>(
    params: InterfaceParams
  ): Promise<M> {
    const iface = await this.fetchInterface(params);
    const methods = this.getMethods(iface);
    return methods.reduce<M>((api, [n, m]) => ({ ...api, [n]: m }), {} as M);
  }

  private getMethods(iface: FixedDBusInterface): MethodTuple[] {
    const methodNames = Object.keys(iface.object.method);
    return methodNames.map(n => [n, promisify(iface.n.bind(iface))]);
  }

  private fetchInterface(params: InterfaceParams): Promise<FixedDBusInterface> {
    return new Promise((resolve, reject) => {
      const { service, path, name } = params;
      SystemBus.bus.getInterface(service, path, name, (err, iface) => {
        return err
          ? reject(new Error(`${err.message}: ${service} ${path} ${name}`))
          : resolve(iface as FixedDBusInterface);
      });
    });
  }
}
