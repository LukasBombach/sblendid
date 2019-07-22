import chalk from "chalk";
import Sblendid from "../src";

(async () => {
  try {
    const sblendid = new Sblendid();

    await sblendid.powerOn();

    sblendid.startScanning(async peripheral => {
      process.stdout.write(".");
      if (peripheral.connectable) {
        await sblendid.stopScanning();

        await peripheral.connect();
        console.log("\n", chalk.red("Peripheral"), peripheral, "\n");

        const services = await peripheral.getServices();

        for (const service of services) {
          console.log("\n" + chalk.yellow("service"), chalk.cyan(service.uuid.toString()));

          const characteristics = await service.getCharacteristics();
          for (const characteristic of characteristics) {
            const descriptors = await characteristic.getDescriptors();
            const { uuid, properties } = characteristic;
            const props = Object.entries(properties)
              .map(([name, val]) => (val ? name : val))
              .filter(Boolean);
            console.log(chalk.blue("characteristic"), { uuid, props, descriptors });
          }
        }

        console.log("\n");

        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const characteristic of characteristics) {
            const suuid = chalk.yellow(service.uuid.toString().substr(0, 4));
            const cuuid = chalk.blue(characteristic.uuid.toString().substr(0, 4));
            const read = chalk.grey("read");
            const notify = chalk.green("notify");

            if (characteristic.properties.read) {
              const value = await characteristic.read();
              console.log(read, suuid, cuuid, value.toString("hex"));
            }

            if (characteristic.properties.notify) {
              characteristic.on("notify", value => {
                console.log(notify, suuid, cuuid, value.toString("hex"));
              });
            }
          }
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
