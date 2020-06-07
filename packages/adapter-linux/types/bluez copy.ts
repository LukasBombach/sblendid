export type DBusInterfaces = [
  {
    name: "org.bluez.Adapter1";
    events: {};
    properties: {};
    methods: {
      StartDiscovery(callback: (err: Error | null) => void): void;
      StopDiscovery(callback: (err: Error | null) => void): void;
    };
  }
];

/* 
export type Methods<K extends keyof DBusInterfaces> = Omit<
  DBusInterfaces[K],
  "on" | "off" | "object"
>;

export interface DBusInterfaces {
  "org.bluez.Adapter1": {
    on: (name: never, listener: never) => void;
    off: (name: never, listener: never) => void;
    getProperty: (name: never, callback: never) => void;
    object: {
      method: Record<keyof Methods<"org.bluez.Adapter1">, unknown>;
    };
    StartDiscovery(callback: (err: Error | null) => void): void;
    StopDiscovery(callback: (err: Error | null) => void): void;
  };
} */
