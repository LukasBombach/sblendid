import { EventEmitter } from "events";
import { promisify } from "util";
import DBus from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default async function getBluez() {
  const adapter = await getAdapter();
  const events = await getEventEmitter();
  const startDiscovery = promisify(adapter.StartDiscovery.bind(adapter));
  const stopDiscovery = promisify(adapter.StopDiscovery.bind(adapter));

  return {
    startDiscovery,
    stopDiscovery,
    events
  };
}

function getAdapter(): Promise<DBus.DBusInterface> {
  return getInterface("org.bluez", "/org/bluez/hci0", "org.bluez.Adapter1");
}

function getObjectManager() {
  return getInterface("org.bluez", "/", "org.freedesktop.DBus.ObjectManager");
}

async function getEventEmitter() {
  const objectManager = await getObjectManager();
  const emitter = new EventEmitter();

  objectManager.on("InterfacesAdded", (path: any, interfaces: any) => {
    if ("org.bluez.Device1" in interfaces) {
      emitter.emit("discover", interfaces["org.bluez.Device1"]);
    }
  });

  return emitter;
}
