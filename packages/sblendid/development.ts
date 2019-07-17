import Sblendid from "./src";
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const timeout = 500;

(async () => {
  try {
    const sblendid = new Sblendid();

    await sblendid.powerOn();

    sblendid.startScanning(async peripheral => {
      process.stdout.write(".");
      if (
        peripheral.connectable &&
        peripheral.advertisement &&
        peripheral.advertisement.serviceUuids &&
        peripheral.advertisement.serviceUuids.length
      ) {
        await sblendid.stopScanning();
        console.log("\nFound Peripheral");
        console.log(peripheral);
        console.log("Connecting");
        await peripheral.connect();
        console.log("Connected.");
        // console.log("Initializing");
        // await peripheral.init();
        console.log("Requesting services");
        const services = await peripheral.getServices();
        console.log(`Fetched ${services.length} services`);
        console.log("Requesting characteristics");
        const characteristics = await services[0].getCharacteristics();
        for (const characteristic of characteristics) {
          console.log(require("util").inspect(characteristic, { depth: 10 }));
        }
        process.exit();
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
