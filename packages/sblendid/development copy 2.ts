import Sblendid from "./src";
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const timeout = 500;

(async () => {
  const sblendid = new Sblendid();

  await sblendid.powerOn();

  sblendid.startScanning(
    ({ uuid, connectable, rssi }) => connectable && console.log({ uuid, rssi })
  );

  await wait(timeout);

  await await sblendid.stopScanning();

  process.exit();
})();
