/// <reference path="./src/types/global.d.ts" />
import BluezDBus from "./src/adapterBluez/bluezDBus";

(async () => {
  try {
    const bluezDBus = new BluezDBus();

    const adapter = await bluezDBus.getAdapter();
    const objectManager = await bluezDBus.getObjectManager();

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
