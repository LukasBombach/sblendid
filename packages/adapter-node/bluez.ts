import Bluez from "./src/linux/bluez";

(async () => {
  try {
    const bluez = new Bluez();
    const adapter = await bluez.getAdapter();
    const objectManager = await bluez.getObjectManager();

    objectManager.on("InterfacesAdded", (path, iface) => {
      console.log(path, iface);
    });

    await adapter.StartDiscovery();
    await new Promise(res => setTimeout(res, 2000));
    await adapter.StopDiscovery();

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
