import Service from "./service";

const info = {
  uuid: "180a",
  encode: (v: string) => Buffer.from(v, "utf-8"),
  decode: (v: Buffer) => v.toString()
};

const pressure = {
  uuid: "1810",
  decode: (v: Buffer) => v.readInt32BE(0)
};

const converters = { info, pressure };

const service = new Service(converters);
const service2 = new Service();

(async () => {
  const infoValue = await service.read("info");
  const pressureValue = await service.read("pressure");
  await service.write("info", "12");
  await service.write("pressure", 12);

  const infoValue2 = await service2.read("a002");
  const pressureValue2 = await service2.read("a003");
  const pressureValue3 = await service2.read(2222);
  const pressureValue4 = await service2.read(false);
  await service2.write("info", Buffer.from("something"));
  await service2.write("pressure", Buffer.from("12"));
})();
