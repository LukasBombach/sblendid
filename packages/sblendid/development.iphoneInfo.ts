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
      const { uuid, address, connectable, manufacturerData } = peripheral;
      console.log({ uuid, address, connectable, data: manufacturerData.toString("hex") });
      return Boolean(connectable) && manufacturerData.toString("hex").startsWith("4c00");
    });

    /* const iPhone = await Sblendid.connect(({ manufacturerData }) => {
      const str = manufacturerData.toString("hex");
      if (str) console.log(str);
      return false;
    }); */

    console.log("Connected to", iPhone);

    const services = await iPhone.getServices();

    console.log(services.map(({ uuid }) => uuid));

    const deviceInfo = await iPhone.getService("180a", converters);

    console.log(deviceInfo);

    const manufacturer = await deviceInfo.read("manufacturer");
    const model = await deviceInfo.read("model");

    console.log("Manufacturer:", manufacturer);
    console.log("Model:", model);
  } catch (error) {
    console.error(error);
  }
})();
