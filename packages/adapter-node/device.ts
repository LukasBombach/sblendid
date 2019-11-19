import SblendidAdapter from "./src";
import SystemBus from "./src/linux/systemBus";

(async () => {
  try {
    console.log("Starting script");

    const adapter = new SblendidAdapter();
    const systemBus = new SystemBus();

    const band = await adapter.find((...peripheral) => {
      const [, , , , advertisement] = peripheral;
      return (
        !!advertisement.localName && /Smart Band/i.test(advertisement.localName)
      );
    });

    console.log("done");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
