import SystemBus from "./src/systemBus";

export interface Interfaces {
  "org.bluez.Device1"?: boolean;
  "org.bluez.GattService1"?: boolean;
  "org.bluez.GattCharacteristic1"?: boolean;
}

interface AdapterApi {
  methods: {
    StartDiscovery: () => Promise<void>;
    StopDiscovery: () => Promise<void>;
  };
}

interface ObjectManagerApi {
  events: {
    InterfacesAdded: (path: string, interfaces: Interfaces) => void;
  };
}

(async () => {
  try {
    // const bluezDBus = new BluezDBus();
    // const adapter = await bluezDBus.getAdapter();
    // const objectManager = await bluezDBus.getObjectManager();

    const systemBus = new SystemBus();

    const adapter = await systemBus.getInterface<AdapterApi>(
      "org.bluez",
      "/org/bluez/hci0",
      "org.bluez.Adapter1"
    );
    const objectManager = await systemBus.getInterface<ObjectManagerApi>(
      "org.bluez",
      "/",
      "org.freedesktop.DBus.ObjectManager"
    );

    objectManager.on("InterfacesAdded", (path, iface) => {
      console.log(path, iface);
    });

    await adapter.StartDiscovery();
    await new Promise(res => setTimeout(res, 5000));
    await adapter.StopDiscovery();

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
