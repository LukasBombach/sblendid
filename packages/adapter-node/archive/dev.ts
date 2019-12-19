import { inspect } from "util";
import SblendidAdapter from "./src";

(async () => {
  try {
    console.log("Starting dev script");
    const adapter = new SblendidAdapter();
    const name = /roidmi/i;
    // const name = /find me/i;

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
    console.log("Connected.");

    // console.log("Connected. Loading services...");
    // const services = await adapter.getServices(uuid);
    // console.log("Got services");
    // console.log(services);

    try {
      console.log("Waiting 1000ms");
      await new Promise(res => setTimeout(res, 1000));
      console.log("Getting RSSI...");
      const rssi = await adapter.getRssi(uuid);
      console.log(rssi);
    } catch (error) {
      console.log(error);
    }

    console.log("Now disconnecting...");
    await adapter.disconnect(uuid);

    console.log("done");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
