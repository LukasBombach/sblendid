import chalk from "chalk";
import PQueue from "p-queue";
import Sblendid from "../src";

(async () => {
  const sblendid = await Sblendid.powerOn();
  const queue = new PQueue({ concurrency: 1 });

  sblendid.startScanning(async peripheral => {
    await queue.add(async () => {
      if (!peripheral.connectable) return;

      await peripheral.connect();
      const services = await peripheral.getServices();
      await peripheral.disconnect();

      const uuid = chalk.blue(peripheral.uuid);
      const serviceUUIDs = services.map(s => s.uuid);

      console.log(uuid, serviceUUIDs);
    });
  });
})();
