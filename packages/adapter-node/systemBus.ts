import SystemBus from "./src/adapterBluez/systemBus";
import { Interfaces } from "./src/adapterBluez/objectManager";

(async () => {
  try {
    interface AdapterApi {
      methods: {
        StartDiscovery: () => Promise<void>;
        StopDiscovery: () => Promise<void>;
      };
    }

    interface ObjectManagerApi {
      events: {
        InterfacesAdded: [string, Interfaces];
      };
    }

    const systemBus = new SystemBus();

    const adapterParams = {
      service: "org.bluez",
      path: "/org/bluez/hci0",
      name: "org.bluez.Adapter1"
    };

    const objectManagerParams = {
      service: "org.bluez",
      path: "/",
      name: "org.freedesktop.DBus.ObjectManager"
    };

    const adapter = await systemBus.getInterface<AdapterApi>(adapterParams);
    const objectManager = await systemBus.getInterface<ObjectManagerApi>(
      objectManagerParams
    );

    console.log("on InterfacesAdded");
    objectManager.on("InterfacesAdded", (path, iface) => {
      console.log(path, iface);
    });

    console.log("StartDiscovery");
    await adapter.StartDiscovery();

    console.log("Awaiting 5 seconds");
    await new Promise(res => setTimeout(res, 5000));

    console.log("StopDiscovery");
    await adapter.StopDiscovery();

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
