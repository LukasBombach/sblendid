import { inspect } from "util";
import SblendidAdapter from "./src";

(async () => {
  try {
    console.log("Starting dev script");
    const adapter = new SblendidAdapter();

    /* let i = 10;
    await adapter.find((...p) => {
      console.log(p);
      return --i <= 0;
    }); */

    const peripheral = await adapter.find((...peripheral) => {
      const [, , , , advertisement] = peripheral;
      return (
        !!advertisement.localName && /roidmi/i.test(advertisement.localName)
      );
    });

    console.log("\n");
    console.log("Found", peripheral);

    const [uuid] = peripheral;

    // console.log("Connecting...");
    // await adapter.connect(uuid);

    const servicesResolved = await adapter.getServices(uuid);
    console.log("servicesResolved");
    console.log(typeof servicesResolved);
    console.log(servicesResolved);

    // console.log("Connected, now disconnecting...");
    // await adapter.disconnect(uuid);

    console.log("done");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
