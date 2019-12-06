import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";
import { ApiDefinition, InterfaceApi } from "../../types/dbus";
import {
  EventApi,
  MethodApi,
  EventMethod,
  GetPropertyApi
} from "../../types/dbus";

export default class SystemBus {
  private static bus = DBus.getBus("system");
  public static fetchInterface = promisify(
    SystemBus.bus.getInterface.bind(SystemBus.bus)
  );

  public async getInterface<A extends ApiDefinition>(
    service: string,
    path: string,
    name: string
  ): Promise<InterfaceApi<A>> {
    const iface = await SystemBus.fetchInterface(service, path, name);
    const methods: MethodApi<A> = this.getMethods(iface);
    const events: EventApi<A> = this.getEvents(iface);
    const getProperty: GetPropertyApi<A> = this.getProperties(iface);
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
