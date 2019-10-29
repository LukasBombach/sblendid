import Bluez from "./src/adapterBluez";
import BluezAdapter from "./src/adapterBluez/adapter";
import SystemBus from "./src/adapterBluez/systemBus";

(async () => {
  try {
    const systemBus = new SystemBus();

    const adapter1 = (await systemBus.getInterface({
      service: "org.bluez",
      path: "/org/bluez/hci0",
      name: "org.bluez.Adapter1"
    })) as any;

    // console.log("adapter1", adapter1);

    const objectManager = (await systemBus.getInterface({
      service: "org.bluez",
      path: "/",
      name: "org.freedesktop.DBus.ObjectManager"
    })) as any;

    // console.log("objectManager", objectManager);

    console.log("objectManager.on InterfacesAdded");
    objectManager.on("InterfacesAdded", (...args: any[]) => {
      console.log("InterfacesAdded", ...args);
    });

    const managedObjects = await objectManager.GetManagedObjects();

    console.log("managedObjects", managedObjects);

    console.log("StartDiscovery");
    await adapter1.StartDiscovery();
    console.log("StartDiscovery command finished");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
