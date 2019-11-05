import SystemBus from "./src/adapterBluez/systemBus";

(async () => {
  try {
    const systemBus = new SystemBus();

    const adapterParams = {
      service: "org.bluez",
      path: "/org/bluez/hci0",
      name: "org.bluez.Adapter1"
    };

    const adapter = await systemBus.getInterface(adapterParams);

    console.log(adapter.object);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
