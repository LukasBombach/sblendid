import BluezAdapter from "./src/adapterBluez/adapter";
import Bluez from "./src/adapterBluez";
import Events from "./src/adapterBluez/events";

(async () => {
  try {
    const adapter = new BluezAdapter();
    // const bluez = new Bluez();

    console.log("new Events");
    const events = new Events();

    console.log("Events init");
    await events.init();

    console.log("on discover");
    events.on("discover", (...args: any[]) => {
      console.log("discover", ...args);
    });

    console.log("startDiscovery");
    adapter.startDiscovery();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
