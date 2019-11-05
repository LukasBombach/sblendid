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

type InterfaceDescriptor = Record<string, PromiseFn>;
type PromiseFn = (...args: any[]) => Promise<any>;
type MethodTuple = [string, PromiseFn];

export default class SystemBus {
  private static bus = DBus.getBus("system");

  public async getInterface<M extends InterfaceDescriptor>(
    params: InterfaceParams
  ): Promise<M> {
    const iface = await this.fetchInterface(params);
    const methods = this.getMethods(iface);
    return methods.reduce<M>((api, [n, m]) => ({ ...api, [n]: m }), {} as M);
  }

  private promisify(iface: DBusInterface, method: string): PromiseFn {
    return (...args: any[]) => this.asPromised(iface, method, args);
  }

  private asPromised<I extends DBusInterface>(
    iface: I,
    method: keyof I,
    args: any[]
  ): Promise<any> {
    return new Promise((res, rej) => {
      iface[method](...args, (err: Error, ...data: any[]) =>
        err ? rej(err) : res(data)
      );
    });
  }

  private getMethods(iface: FixedDBusInterface): MethodTuple[] {
    const methodNames = Object.keys(iface.object.method);
    return methodNames.map<MethodTuple>(n => [n, this.promisify(iface, n)]);
  }

  private fetchInterface(params: InterfaceParams): Promise<FixedDBusInterface> {
    return new Promise((resolve, reject) => {
      const { service, path, name } = params;
      SystemBus.bus.getInterface(service, path, name, (error, iface) => {
        return error
          ? reject(new Error(`${error.message}: ${service} ${path} ${name}`))
          : resolve(iface as FixedDBusInterface);
      });
    });
  }
}
