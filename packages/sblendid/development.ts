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

        console.log("Requesting services");
        const services = await peripheral.getServices();
        console.log(`Fetched ${services.length} services`);

        console.log("Requesting characteristics");
        const characteristics = await services[0].getCharacteristics();
        console.log(`Fetched ${characteristics.length} characteristics`);

        const readableCharacteristic = characteristics.find(c => c.read);
        const writableCharacteristic = characteristics.find(c => c.write);

        if (readableCharacteristic) {
          console.log("Reading characteristic", readableCharacteristic.uuid);
          const buffer = await readableCharacteristic.read();
          console.log("Got", buffer.toString("hex"));
        } else {
          console.log("Did not find characteristic for reading");
        }

        if (writableCharacteristic) {
          console.log("Writing characteristic", writableCharacteristic.uuid);
          await writableCharacteristic.write(Buffer.from(""));
          console.log("Done");
        } else {
          console.log("Did not find characteristic for writing");
        }

        process.exit();
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
