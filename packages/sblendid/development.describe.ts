import chalk from "chalk";
import Sblendid from "./src";

(async () => {
  try {
    const sblendid = new Sblendid();

    await sblendid.powerOn();

    sblendid.startScanning(async peripheral => {
      process.stdout.write(".");
      if (peripheral.connectable) {
        await sblendid.stopScanning();

        // console.log("\n", chalk.dim("Found Peripheral, Connecting"), "\n");
        await peripheral.connect();
        console.log("\n", chalk.red("Peripheral"), peripheral, "\n");

        // console.log("\n", chalk.dim("Requesting services"), "\n");
        const services = await peripheral.getServices();

        for (const service of services) {
          const { uuid, name, type } = service;
          console.log("\n" + chalk.yellow("service"), chalk.cyan(uuid.toString()));

          // console.log("\n", chalk.dim("Requesting characteristics"), "\n");
          const characteristics = await service.getCharacteristics();
          for (const characteristic of characteristics) {
            const { uuid, properties } = characteristic;
            const props = Object.entries(properties)
              .map(([name, val]) => (val ? name : val))
              .filter(Boolean);
            console.log(chalk.blue("characteristic"), { uuid, props });
          }
        }

        process.exit();
      }
    });
  } catch (error) {
    console.error(error);
  }
})();