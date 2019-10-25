import Bluez from "./src/adapterBluez";

(async () => {
  try {
    const bluez = new Bluez();

    console.log("Attaching discover listener");
    bluez.on("discover", (...peripheral) => {
      console.log("discover event", peripheral);
    });

    console.log("Starting scan");
    await bluez.startScanning();

    await new Promise(res => setTimeout(res, 5000));

    console.log("Stopping scan");
    await bluez.startScanning();

    /* console.log("TS compiled, initializing adapter");
    const adapter = new Bluez();
    await adapter.init();
    const peripheral = await adapter.find((...peripheral) => {
      console.log(peripheral, "\n");
      return peripheral[4].localName === "Find Me";
    });
    const [pUUID] = peripheral;
    console.log(peripheral);
    console.log(await adapter.getServices(pUUID));
    await adapter.connect(pUUID);
    console.log(await adapter.getServices(pUUID));
    await new Promise(res => setTimeout(res, 2000));
    console.log(await adapter.getServices(pUUID)); */
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
