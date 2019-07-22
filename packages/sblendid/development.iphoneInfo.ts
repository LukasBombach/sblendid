import Sblendid, { CharacteristicConverter } from "./src";

(async () => {
  try {
    const converters: CharacteristicConverter[] = [
      {
        uuid: "2a29",
        name: "manufacturer",
        decode: (buffer: Buffer) => buffer.toString()
      },
      {
        uuid: "2a24",
        name: "model",
        decode: (buffer: Buffer) => buffer.toString()
      }
    ];

    const iPhone = await Sblendid.connect(peripheral => {
      console.log(peripheral.uuid);
      if (!peripheral.advertisement) return false;
      if (!peripheral.advertisement.manufacturerData) return false;
      const mfstr = peripheral.advertisement.manufacturerData.toString("hex");
      console.log(mfstr, mfstr.startsWith("4c00"));
      if (mfstr.startsWith("4c00") && peripheral.connectable) return true;
      return false;
    });

    console.log("Connected to", iPhone);

    const services = await iPhone.getServices();
    console.log(services);

    const deviceInfo = await iPhone.getService("180a", converters);

    const manufacturer = await deviceInfo.read("manufacturer");
    const model = await deviceInfo.read("model");

    console.log("Manufacturer:", manufacturer);
    console.log("Model:", model);
  } catch (error) {
    console.error(error);
  }
})();
