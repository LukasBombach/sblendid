import { promisify } from "util";
import DBus from "dbus";
import type { DBusInterface } from "../../types/dbus";
import type { EventApi } from "../../types/dbus";
import type { MethodApi } from "../../types/dbus";
import type { EventMethod } from "../../types/dbus";
import type { GetPropertyApi } from "../../types/dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  public async getInterface<I extends DBusInterface>(
    service: string,
    path: string,
    name: string
  ): Promise<I> {
    const iface = await getInterface(service, path, name);
    const methods: MethodApi<I> = this.getMethods(iface);
    const events: EventApi<I> = this.getEvents(iface);
    const getProperty: GetPropertyApi<I> = this.getProperties(iface);
    return { ...events, ...methods, ...getProperty };
  }

  private getMethods<I extends DBusInterface>(
    iface: DBus.DBusInterface
  ): MethodApi<I> {
    return Object.keys(iface.object.method).reduce<MethodApi<I>>(
      (api, method) => Object.assign(api, this.asPromised(iface, method)),
      {} as MethodApi<I>
    );
  }

  private getEvents<I extends DBusInterface>(
    iface: DBus.DBusInterface
  ): EventApi<I> {
    const on: EventMethod<I> = (event, listener) => iface.on(event, listener);
    const off: EventMethod<I> = (event, listener) => iface.off(event, listener);
    return { on, off };
  }

  private getProperties<I extends DBusInterface>(
    iface: DBus.DBusInterface
  ): GetPropertyApi<I> {
    const getProperty = promisify(iface.getProperty.bind(iface));
    const getProperties = promisify(iface.getProperties.bind(iface));
    return { getProperty, getProperties } as GetPropertyApi<I>;
  }

  private asPromised<I extends DBusInterface>(iface: I, method: keyof I) {
    return { [method]: promisify(iface[method].bind(iface)) };
  }
}
