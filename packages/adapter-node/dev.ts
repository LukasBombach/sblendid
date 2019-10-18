import Adapter from "./new-src";

(async () => {
  try {
    console.log("TS compiled, initializing adapter");
    const adapter = new Adapter();
    await adapter.init();

    const peripheral = await adapter.find(() => true);
    const [pUUID] = peripheral;

    console.log(peripheral);

    await adapter.connect(pUUID);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
