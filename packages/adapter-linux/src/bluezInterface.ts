import { promisify } from "util";
import DBus from "dbus";

import type { DBusInterface } from "dbus";
import type { BluezInterfaces } from "../types/bluez";
import type { Name, EventName, EventCallback } from "../types/bluez";
import type { Methods, Method, MethodName } from "../types/bluez";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class BluezInterface<T extends BluezInterfaces> {
  private readonly name: Name<T>;
  private readonly path: string;
  private api?: DBusInterface;

  constructor(name: Name<T>, path: string) {
    this.name = name;
    this.path = path;
  }

  async on<E extends EventName<T>>(
    event: E,
    callback: EventCallback<T, E>
  ): Promise<void> {
    const api = await this.getApi();
    api.on(event, callback);
  }

  async off<E extends EventName<T>>(
    event: E,
    callback: EventCallback<T, E>
  ): Promise<void> {
    const api = await this.getApi();
    api.off(event, callback);
  }

  async call(
    method: MethodName<T>,
    ...params: Parameters<
      Promisify<Method<BluezInterfaces, MethodName<BluezInterfaces>>>
    >
  ): Promise<any> {
    const api = await this.getApi<Methods<T>>();
    const m = ((api[method] as any) as CallableFunction).bind(api);
    return await promisify(m)(...params);
  }

  async getProperty(name: string): Promise<any> {
    const api = await this.getApi();
    return await promisify(api.getProperty.bind(api))(name);
  }

  async getProperties(): Promise<Record<string, any>> {
    const api = await this.getApi();
    return await promisify(api.getProperties.bind(api))();
  }

  private async getApi<T = DBusInterface>(): Promise<T> {
    if (!this.api) this.api = await this.fetchApi();
    return (this.api as any) as T;
  }

  private async fetchApi(): Promise<DBusInterface> {
    const name = this.name as string;
    const path = this.path;
    return await getInterface("org.bluez", name, path);
  }
}
