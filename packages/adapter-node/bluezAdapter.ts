import Bluez from "./src/adapterBluez";

(async () => {
  try {
    const bluez = new Bluez();
    await bluez.init();

    const roidmi = await bluez.find((...peripheral) => {
      const [, , , , { localName }] = peripheral;
      process.stdout.write(".");
      return !!localName && /roidmi/i.test(localName);
    });

    console.log("\n", "Found this:");
    console.log(roidmi);

    const [uuid] = roidmi;

    console.log("connecting");
    await bluez.connect(uuid);

    console.log("disconnecting");
    await bluez.disconnect(uuid);

    console.log("done");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
