import Sblendid, { CharacteristicConverter } from "../src";

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

(async () => {
  try {
    const peripheral = await Sblendid.connect(async p => await p.hasService("180a"));
    const deviceInfo = await peripheral.getService("180a", converters);

    const manufacturer = await deviceInfo.read("manufacturer");
    const model = await deviceInfo.read("model");

    console.log("Manufacturer:", manufacturer);
    console.log("Model:", model);

    process.exit();
  } catch (error) {
    console.error(error);
  }
})();

/* 
import Peripheral from "../src/peripheral";
    // const peripheral = await findPeripheralWithInfo();

async function findPeripheralWithInfo(): Promise<Peripheral> {
  const uuids: string[] = [];
  let iPhone: Peripheral | undefined = undefined;

  while (!iPhone) {
    const candidate = await Sblendid.connect(peripheral => {
      const { uuid, connectable } = peripheral;
      if (uuids.includes(uuid)) return false;
      uuids.push(uuid);
      console.log(".");
      return Boolean(connectable);
    });
    await candidate.connect();
    const services = await candidate.getServices();
    if (services.some(({ uuid }) => uuid === "180a")) iPhone = candidate;
  }

  return iPhone;
} */
