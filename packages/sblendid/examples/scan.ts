import chalk from "chalk";
import Sblendid from "../src";

(async () => {
  const sblendid = await Sblendid.powerOn();

  sblendid.startScanning(async p => {
    const uuid = chalk.blue(p.uuid);

    const connectable = p.connectable
      ? chalk.green("connectable    ")
      : chalk.red("not connectable");

    const servicesLabel = "Name";
    const serviceUUIDs = p.advertisement.localName || chalk.dim("Unknown");

    console.log(uuid, connectable, servicesLabel, serviceUUIDs);
  });
})();
