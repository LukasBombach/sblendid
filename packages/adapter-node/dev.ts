import Adapter from "./new-src";

(async () => {
  try {
    console.log("TS compiled, initializing adapter");
    const adapter = new Adapter();
    await adapter.init();
    /* await adapter.on("discover", (...args) => console.log(...args));
    await adapter.startScanning();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await adapter.stopScanning(); */

    const peripheral = await adapter.find(() => true);
    const [pUUID] = peripheral;
    console.log(peripheral);

    await adapter.connect(pUUID);

    /* const peripheral = await adapter.find((...peripheral) => {
      console.log(peripheral);
      return ++connectables >= 5;
    }); */

    /* const peripheral = await adapter.find((...peripheral) => {
      console.log(peripheral);
      const [, , , , { localName }] = peripheral;
      return localName === "ROIDMI Cleaner F1";
    });

    console.log("\n", "found", "\n", peripheral); */

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
