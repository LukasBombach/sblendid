import chalk from "chalk";
import Sblendid from "../src";

(async () => {
  try {
    const sblendid = new Sblendid();
    await sblendid.powerOn();

    sblendid.startScanning(async peripheral => {
      const { uuid, address, addressType, connectable, advertisement, rssi } = peripheral;

      if (!advertisement) {
        return console.log(chalk.dim(uuid), connectable, connectable);
      }
      if (!advertisement.manufacturerData) {
        return console.log(chalk.dim(uuid), connectable, advertisement);
      }
      if (advertisement.manufacturerData) {
        return console.log(
          chalk.dim(uuid),
          connectable,
          chalk.blue(advertisement.manufacturerData.toString("hex"))
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
