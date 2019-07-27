import chalk from "chalk";
import Sblendid from "../src";

(async () => {
  const sblendid = await Sblendid.powerOn();

  sblendid.startScanning(async p => {
    const uuid = chalk.blue(p.uuid);

    const connectable = p.connectable
      ? chalk.green("connectable    ")
      : chalk.red("not connectable");

    const servicesLabel = "Advertised services";
    const serviceUuids = p.advertisement.serviceUuids || chalk.dim("none");

    console.log(uuid, connectable, servicesLabel, serviceUuids);
  });
})();
