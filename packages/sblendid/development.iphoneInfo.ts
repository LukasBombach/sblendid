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

    const iPhone = await Sblendid.connect("33a5fe32e48c416285f50f4092cb562e");

    const deviceInfo = await iPhone.getService("180a", converters);

    const manufacturer = await deviceInfo.read("manufacturer");
    const model = await deviceInfo.read("model");

    console.log("Manufacturer:", manufacturer);
    console.log("Model:", model);
  } catch (error) {
    console.error(error);
  }
})();
