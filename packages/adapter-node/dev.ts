import { inspect } from "util";
import SblendidAdapter from "./src";

(async () => {
  try {
    console.log("Starting dev script");
    const adapter = new SblendidAdapter();

    const peripheral = await adapter.find((...peripheral) => {
      const [, , , , advertisement] = peripheral;
      return !!advertisement.localName && /band/i.test(advertisement.localName);
    });

    console.log("\n");
    console.log("Found", peripheral);

    const [uuid] = peripheral;

    console.log("Connecting...");
    await adapter.connect(uuid);

    console.log("Connected. Loading services...");
    const services = await adapter.getServices(uuid);
    console.log("services");
    console.log(typeof services);
    console.log(services);

    console.log("Connected, now disconnecting...");
    await adapter.disconnect(uuid);

    console.log("done");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
