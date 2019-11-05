import DBus, { DBusInterface } from "dbus";

export interface InterfaceParams {
  service: string;
  path: string;
  name: string;
}

interface FixedDBusInterface {
  object: {
    method: Record<string, any>;
  };
}

type InterfaceDescriptor = Record<string, PromiseFn>;
type PromiseFn = (...args: any[]) => Promise<any>;

export default class SystemBus {
  private static bus = DBus.getBus("system");

  public async getInterface<M extends InterfaceDescriptor>(
    params: InterfaceParams
  ): Promise<M> {
    const iface = await this.fetchInterface<M>(params);
    const methods = this.getMethods(iface);

    return methods.reduce<M>(
      (api, method) => ({
        ...api,
        [method]: this.promisify(iface, method)
      }),
      {} as M
    );
  }

  private promisify(iface: FixedDBusInterface, method: string): PromiseFn {
    return (...args: any[]) => this.asPromised(iface, method, args);
  }

  private asPromised<I extends FixedDBusInterface>(
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

  private getMethods(dbusInterface: FixedDBusInterface) {
    return Object.keys(dbusInterface.object.method);
  }

  private fetchInterface<M extends InterfaceDescriptor>(
    params: InterfaceParams
  ): Promise<FixedDBusInterface & M> {
    return new Promise((resolve, reject) => {
      const { service, path, name } = params;
      SystemBus.bus.getInterface(service, path, name, (error, iface) => {
        return error
          ? reject(new Error(`${error.message}: ${service} ${path} ${name}`))
          : resolve((iface as any) as FixedDBusInterface & M); // todo unlawful any
      });
    });
  }
}
