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

type FetchInterface = (
  service: string,
  path: string,
  name: string
) => Promise<FixedDBusInterface>;

interface Api {
  methods?: Record<string, PromiseFn>;
  events?: Record<string, any[]>;
}

type EventApi<A extends Api> = {
  on: Listener<A>;
  off: Listener<A>;
};

type MethodApi<A extends Api> = A["methods"];

type InterfaceApi<A extends Api> = EventApi<A> & MethodApi<A>;

type Event<A extends Api> = keyof A["events"];

type Params<A extends Api, E extends Event<A>> = A["events"] extends Record<
  string,
  any[]
>
  ? A["events"][E] extends any[]
    ? A["events"][E]
    : []
  : [];

type Listener<A extends Api> = <E extends Event<A>>(
  event: E,
  listener: (...val: Params<A, E>) => void
) => void;

export default class SystemBus {
  private static bus = DBus.getBus("system");
  private fetchInterface: FetchInterface;

  constructor() {
    const getInterface = SystemBus.bus.getInterface.bind(SystemBus.bus);
    this.fetchInterface = promisify(getInterface) as FetchInterface;
  }

  public async getInterface<A extends Api>(
    params: InterfaceParams
  ): Promise<InterfaceApi<A>> {
    const { service, path, name } = params;
    const iface = await this.fetchInterface(service, path, name);
    const methods: MethodApi<A> = this.getMethods(iface);
    const events: EventApi<A> = this.getEvents(iface);
    return { ...events, ...methods };
  }

  private getMethods<A extends Api>(iface: FixedDBusInterface): MethodApi<A> {
    const methodNames = Object.keys(iface.object.method);
    const methods = methodNames.map<MethodTuple>(n => [
      n,
      promisify(iface[n].bind(iface))
    ]);
    return methods.reduce<MethodApi<A>>(
      (api, [n, m]) => ({ ...api, [n]: m }),
      {} as MethodApi<A>
    );
  }

  private getEvents<A extends Api>(iface: FixedDBusInterface): EventApi<A> {
    const on: Listener<A> = (event, listener) => iface.on(event, listener);
    const off: Listener<A> = (event, listener) => iface.off(event, listener);
    return { on, off };
  }
}
