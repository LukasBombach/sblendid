import BluezAdapter from "./src/adapterBluez/adapter";

(async () => {
  try {
    const bluez = new BluezAdapter();
    await bluez.startDiscovery();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
