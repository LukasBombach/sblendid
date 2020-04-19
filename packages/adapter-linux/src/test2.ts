import DBus from "dbus";
import { promisify } from "util";

import type { InterfaceApi } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

bus.getInterface("service", "path", "name", (err, iface) => {
  console.log(iface);
});

getInterface("service", "path", "name").then((iface) => {
  console.log(iface);
});

async function getGet<I>(
  service: string,
  path: string,
  name: string
): Promise<I> {
  bus.getInterface<I>(service, path, name, (err, iface) => {
    console.log(iface);
  });

  const iface = await getInterface<I>(service, path, name);
  console.log(iface);

  return {};
}
