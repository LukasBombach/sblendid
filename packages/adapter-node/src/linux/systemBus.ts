import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";
import type { ApiDefinition } from "../../types/dbus";
import type { InterfaceApi } from "../../types/dbus";
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
  ): Promise<InterfaceApi<I>> {
    const iface = await getInterface(service, path, name);
    const methods: MethodApi<I> = this.getMethods(iface);
    const events: EventApi<I> = this.getEvents(iface);
    const getProperty: GetPropertyApi<I> = this.getProperties(iface);
    return { ...events, ...methods, ...getProperty };
  }

  private getMethods<A extends ApiDefinition>(
    iface: DBusInterface
  ): MethodApi<A> {
    return Object.keys(iface.object.method).reduce<MethodApi<A>>(
      (api, method) => Object.assign(api, this.asPromised(iface, method)),
      {} as MethodApi<A>
    );
  }

  private getEvents<A extends ApiDefinition>(
    iface: DBusInterface
  ): EventApi<A> {
    const on: EventMethod<A> = (event, listener) => iface.on(event, listener);
    const off: EventMethod<A> = (event, listener) => iface.off(event, listener);
    return { on, off };
  }

  private getProperties<A extends ApiDefinition>(
    iface: DBusInterface
  ): GetPropertyApi<A> {
    const getProperty = promisify(iface.getProperty.bind(iface));
    const getProperties = promisify(iface.getProperties.bind(iface));
    return { getProperty, getProperties } as GetPropertyApi<A>;
  }

  private asPromised<I extends DBusInterface>(iface: I, method: keyof I) {
    return { [method]: promisify(iface[method].bind(iface)) };
  }
}
