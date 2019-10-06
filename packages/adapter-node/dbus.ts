import { promisify } from "util";
import DBus from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

(async () => {
  try {
    const adapter = await getAdapter();
    const objectManager = await getObjectManager();
    const getProperties = promisify(adapter.getProperties.bind(adapter));
    const startDiscovery = promisify(adapter.StartDiscovery.bind(adapter));
    const stopDiscovery = promisify(adapter.StopDiscovery.bind(adapter));
    const properties = await getProperties();
    console.log(adapter);
    console.log(properties);
    console.log(objectManager);

    objectManager.on("InterfacesAdded", (path: any, interfaces: any) => {
      if ("org.bluez.Device1" in interfaces) {
        const props = interfaces["org.bluez.Device1"];
        console.log("Found new Device", props);
      }
    });

    adapter.on("device", async (...args: any[]) => {
      console.log("Found new Device", args);
    });

    await startDiscovery();
    console.log("Started discovery");
    await new Promise(res => setTimeout(res, 5000));
    await stopDiscovery();
    console.log("Stopped discovery");
    process.exit();
  } catch (error) {
    console.error(error);
  }
})();

function getAdapter(): Promise<DBus.DBusInterface> {
  return getInterface("org.bluez", "/org/bluez/hci0", "org.bluez.Adapter1");
}

function getObjectManager() {
  return getInterface("org.bluez", "/", "org.freedesktop.DBus.ObjectManager");
}
