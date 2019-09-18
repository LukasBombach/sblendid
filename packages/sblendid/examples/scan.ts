import chalk from "chalk";
import Sblendid from "../src";

(async () => {
  const sblendid = await Sblendid.powerOn();

  sblendid.startScanning(async peripheral => {
    const uuid = chalk.blue(peripheral.uuid);

    const connectable = peripheral.connectable
      ? chalk.green("connectable    ")
      : chalk.red("not connectable");

    const name = peripheral.name || chalk.dim("Unknown");

    console.log(uuid, connectable, name);
  });
})();
