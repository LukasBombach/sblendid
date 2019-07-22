import Sblendid from "../src";
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
        //await sblendid.stopScanning();
        await peripheral.connect();
        const services = await peripheral.getServices();
        services.forEach(async service => {
          const characteristics = await service.getCharacteristics();
          const notifyableCharacteristics = characteristics.filter(c => c.properties.notify);

          notifyableCharacteristics.forEach(async characteristic => {
            console.log("listening", peripheral.uuid, service.uuid, characteristic.uuid);
            await characteristic.on("notify", val => {
              console.log(peripheral.uuid, val);
            });
          });
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
