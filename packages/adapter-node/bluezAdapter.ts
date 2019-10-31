import Bluez from "./src/adapterBluez";

(async () => {
  try {
    const bluez = new Bluez();
    await bluez.init();

    const namedPeripheral = await bluez.find((...peripheral) => {
      const [, , , , { localName }] = peripheral;
      process.stdout.write(".");
      return Boolean(localName);
    });

    console.log("\n", "Found this:");
    console.log(namedPeripheral);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
