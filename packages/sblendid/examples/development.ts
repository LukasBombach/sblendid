import chalk from "chalk";
import Sblendid from "../src";

// EE215A96-AE34-433F-8711-11F0E911823A

(async () => {
  try {
    const peripheral = await Sblendid.connect("Find Me");
    const services = await peripheral.getServices();

    for (const service of services) {
      console.log(chalk.blue(`service ${service.uuid}`));

      if (service.uuid === "180a") {
        console.log(chalk.red(`Device Info Service`));
        console.log("manufacturer", await service.read("2a29"));
        console.log("model", await service.read("2a24"));
      }

      // const characteristics = await service.getCharacteristics();
      // for (const characteristic of Object.values(characteristics)) {
      //   console.log(characteristic.uuid, characteristic.properties);
      // }
      // if (service.uuid === "1802") {
      //   service.on("2a06", (...args) => console.log("2a06!", args));
      // }
    }
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();
