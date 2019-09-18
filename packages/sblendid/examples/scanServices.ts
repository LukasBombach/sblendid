import chalk from "chalk";
import PQueue from "p-queue";
import Sblendid from "../src";

(async () => {
  const sblendid = await Sblendid.powerOn();
  const queue = new PQueue({ concurrency: 1 });

  sblendid.startScanning(async peripheral => {
    await queue.add(async () => {
      const uuid = chalk.blue(peripheral.uuid);
      const services = await peripheral.getServices();
      const serviceUUIDs = services.map(s => s.uuid);

      console.log(uuid, serviceUUIDs);
    });
  });
})();
