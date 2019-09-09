import chalk from "chalk";
import Sblendid from "../src";

// EE215A96-AE34-433F-8711-11F0E911823A

(async () => {
  try {
    const peripheral = await Sblendid.connect("Find Me");
    const services = await peripheral.getServices();

    for (const service of services) {
      console.log(chalk.blue(`service ${service.uuid}`));

      // if (service.uuid === "180a") {
      //   console.log(chalk.red(`Device Info Service`));
      //   console.log("manufacturer", await service.read("2a29"));
      //   console.log("model", await service.read("2a24"));
      // }

      const characteristics = await service.getCharacteristics();
      for (const characteristic of characteristics) {
        const { uuid, properties } = characteristic;
        console.log(chalk.blue(`characteristic ${uuid}`));
        if (properties.write) {
          console.log("writing", uuid);
          await characteristic.write(Buffer.from("test", "utf-8"));
          // process.exit();
        }
        // console.log(characteristic.properties);
        // if (characteristic.properties.notify) {
        //   console.log("sub", characteristic.uuid);
        //   characteristic.on("notify", (...args) => {
        //     console.log(chalk.red(`${characteristic.uuid}`), args);
        //   });
        // }
      }

      // if (service.uuid === "1802") {
      //   service.on("2a06", (...args) => console.log("2a06!", args));
      // }
    }
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();
