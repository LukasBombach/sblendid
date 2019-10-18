import Adapter from "./new-src";

(async () => {
  try {
    console.log("TS compiled, initializing adapter");
    const adapter = new Adapter();
    await adapter.init();

    const peripheral = await adapter.find((...peripheral) => {
      console.log(peripheral);
      return peripheral[4].localName === "Find Me";
    });
    const [pUUID] = peripheral;

    console.log(peripheral);

    await adapter.connect(pUUID);

    await new Promise(res => setTimeout(res, 60000));

    // await adapter.disconnect(pUUID);

    // process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
