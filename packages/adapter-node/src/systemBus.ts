import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";
import {
  InputApi,
  OutputApi,
  EventApi,
  MethodApi,
  EventMethod
} from "../types/dbus";

export default class SystemBus {
  private static bus = DBus.getBus("system");
  private static fetchInterface = promisify(
    SystemBus.bus.getInterface.bind(SystemBus.bus)
  );

  public async getInterface<A extends InputApi>(
    service: string,
    path: string,
    name: string
  ): Promise<OutputApi<A>> {
    const iface = await SystemBus.fetchInterface(service, path, name);
    const methods: MethodApi<A> = this.getMethods(iface);
    const events: EventApi<A> = this.getEvents(iface);
    return { ...events, ...methods };
  }

  private getMethods<A extends InputApi>(iface: DBusInterface): MethodApi<A> {
    return Object.keys(iface.object.method).reduce<MethodApi<A>>(
      (api, method) => Object.assign(api, this.asPromised(iface, method)),
      {} as MethodApi<A>
    );
  }

  private getEvents<A extends InputApi>(iface: DBusInterface): EventApi<A> {
    const on: EventMethod<A> = (event, listener) => iface.on(event, listener);
    const off: EventMethod<A> = (event, listener) => iface.off(event, listener);
    return { on, off };
  }

  private asPromised<I extends DBusInterface>(iface: I, method: keyof I) {
    return { [method]: promisify(iface[method].bind(iface)) };
  }
}
