import { promisify } from "util";
import DBus from "dbus";
import type { DBusBluezInterfaces } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class BluezInterface<T extends keyof DBusBluezInterfaces> {
  private readonly name: string;
  private readonly path: T;
  private api?: DBusBluezInterfaces[T];

  constructor(name: string, path: T) {
    this.name = name;
    this.path = path;
  }

  async on(event: string, callback: (...values: any[]) => {}): Promise<void> {
    const api = await this.getApi();
    api.on(event, callback);
  }

  async off(event: string, callback: (...values: any[]) => {}): Promise<void> {
    const api = await this.getApi();
    api.off(event, callback);
  }

  async call(method: string, ...parameters: any[]): Promise<any> {
    const api = await this.getApi();
    return await promisify(api[method].bind(api))(...parameters);
  }

  async getProperty(name: string): Promise<any> {
    return await this.call("getProperty", name);
  }

  async getProperties(): Promise<Record<string, any>> {
    return await this.call("getProperties");
  }

  private async getApi(): Promise<DBusBluezInterfaces[T]> {
    if (!this.api) this.api = await this.fetchApi();
    return this.api;
  }

  private async fetchApi(): Promise<DBusBluezInterfaces[T]> {
    return await getInterface("org.bluez", this.name, this.path);
  }
}
