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
        const props = Object.entries(properties)
          .filter(([, v]) => v)
          .map(([p]) => p)
          .join(", ");
        console.log(chalk.redBright(`characteristic ${uuid}`), props);

        if (service.uuid === "1805" && characteristic.uuid === "2a2b") {
          const notify = await characteristic.on("notify", value => {
            const buffer = value as Buffer;
            console.log("got value", value);
          });
          console.log("notify", notify);
        }
      }
    }
    // process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();
