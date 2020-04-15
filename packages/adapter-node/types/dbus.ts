export interface DBusInterface {
  methods: Record<string, (...args: any[]) => Promise<any>>;
  events: Record<string, any[]>;
  props: Record<string, any>;
}

export type DBusApi<I extends DBusInterface> = MethodApi<I> &
  EventsApi<I> &
  PropertiesApi<I>;

export type MethodApi<I extends DBusInterface> = I["methods"];

export interface EventsApi<I extends DBusInterface> {
  on: EventMethod<I>;
  off: EventMethod<I>;
}

export interface PropertiesApi<I extends DBusInterface> {
  getProperty: <K extends keyof I["props"]>(name: K) => Promise<I["props"][K]>;
  getProperties: () => Promise<I["props"]>;
}

export type EventMethod<I extends DBusInterface> = <
  K extends keyof I["events"]
>(
  event: K,
  listener: (...args: I["events"][K]) => Promish<void>
) => void;
