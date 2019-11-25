import { inspect } from "util";
import SblendidAdapter from "./src";

(async () => {
  try {
    console.log("Starting dev script");
    const adapter = new SblendidAdapter();
    const name = /roidmi/i;

    console.log("Finding device... ");
    const peripheral = await adapter.find((...peripheral) => {
      const [, , , , advertisement] = peripheral;
      process.stdout.write(".");
      return !!advertisement.localName && name.test(advertisement.localName);
    });

    console.log("\n");
    console.log("Found", peripheral);

    const [uuid] = peripheral;

    console.log("Connecting...");
    await adapter.connect(uuid);

    console.log("Connected. Loading services...");
    const services = await adapter.getServices(uuid);
    console.log("Got services");
    console.log(services);

    console.log("Now disconnecting...");
    await adapter.disconnect(uuid);

    console.log("done");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
