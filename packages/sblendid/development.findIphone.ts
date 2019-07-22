import Sblendid, { CharacteristicConverter } from "./src";

(async () => {
  try {
    const splendid = new Sblendid();

    splendid.startScanning(peripheral => {
      const { uuid, address, connectable, manufacturerData } = peripheral;

      const isPotentialIPhone = manufacturerData.toString("hex").startsWith("4c00");

      if (connectable && isPotentialIPhone) {
        console.log("");
        console.log({ uuid, address });
        console.log("");
      } else {
        process.stdout.write(".");
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
