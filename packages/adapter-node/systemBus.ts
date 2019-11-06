import SystemBus from "./src/adapterBluez/systemBus";
import { Interfaces } from "./src/adapterBluez/objectManager";

(async () => {
  try {
    interface Adapter {
      methods: {
        StartDiscovery: () => Promise<void>;
        StopDiscovery: () => Promise<void>;
      };
    }

    interface ObjectManager {
      events: {
        InterfacesAdded: Interfaces;
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

    const adapter = await systemBus.getInterface<Adapter>(adapterParams);
    const objectManager = await systemBus.getInterface<ObjectManager>(
      objectManagerParams
    );

    console.log("StartDiscovery");
    await adapter.StartDiscovery();
    console.log("StopDiscovery");
    await adapter.StopDiscovery();

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
