import util from "util";
import SystemBus from "./src/linux/systemBus";

(async () => {
  try {
    console.log("Starting...");
    const adapter = await getAdapter();
    const manager = await getObjectManager();
    const path = await findRoidmi(adapter, manager);
    const device = await getDevice(path);
    const getProps = util.promisify(device.getProperties.bind(device));

    const servicesResolved = new Promise(res => {
      manager.on("InterfacesAdded", async (path: string, interfaces: any) => {
        const service = interfaces["org.bluez.GattService1"];
        const characteristic = interfaces["org.bluez.GattCharacteristic1"];

        if (service || characteristic) {
          const props = await getProps();
          console.log("Got service or characteristic.");
          console.log("Services are resolved", props.ServicesResolved);
          if (props.ServicesResolved) res();
        } else {
          console.log("Got interfaces", Object.keys(interfaces));
        }
      });
    });

    console.log(inspect(device.object));

    console.log("Connecting...");
    await device.Connect();
    console.log("Connected!");

    console.log("Waiting for services resolved...");
    await servicesResolved;

    console.log("Disconnecting...");
    await device.Disconnect();
    console.log("Disconnected!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();

function findRoidmi(adapter: any, manager: any): Promise<string> {
  return findDevice(adapter, manager, device => /roidmi/.test(device.Alias));
}

function findDevice(
  adapter: any,
  manager: any,
  callback: (device: any) => boolean
): Promise<string> {
  return new Promise(async res => {
    manager.on("InterfacesAdded", (path: string, interfaces: any) => {
      console.log("got interfaces", interfaces);
      const device = interfaces["org.bluez.Device1"];
      if (callback(device)) {
        adapter.StopDiscovery();
        console.log("found");
        res(path);
      }
    });
    // console.log("Stopping discovery");
    // await adapter.StopDiscovery();
    console.log("Managed Objects", manager.GetManagedObjects());
    console.log("Starting discovery");
    await adapter.StartDiscovery();
  });
}

function interfacesAdded(...args: any[]) {
  console.log("InterfacesAdded", inspect(args));
}

function getAdapter(): Promise<any> {
  return SystemBus.fetchInterface(
    "org.bluez",
    "/org/bluez/hci0",
    "org.bluez.Adapter1"
  );
}

function getObjectManager(): Promise<any> {
  return SystemBus.fetchInterface(
    "org.bluez",
    "/",
    "org.freedesktop.DBus.ObjectManager"
  );
}

function getDevice(path: string): Promise<any> {
  return SystemBus.fetchInterface("org.bluez", path, "org.bluez.Device1");
}

function getService(path: string): Promise<any> {
  return SystemBus.fetchInterface("org.bluez", path, "org.bluez.GattService1");
}

function getCharacteristic(path: string): Promise<any> {
  return SystemBus.fetchInterface(
    "org.bluez",
    path,
    "org.bluez.GattCharacteristic1"
  );
}

function inspect(obj: any) {
  return util.inspect(obj, { depth: 10, colors: true });
}
