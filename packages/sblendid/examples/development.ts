import { Converter } from "../src/characteristic";
import Service, { Converters } from "../src/service";

(async () => {
  type State = "idle" | "sleep";

  interface Water {
    level: number;
    initialLevel: number;
  }

  interface MyConverters {
    state: Converter<State>;
    water: Converter<Water>;
  }

  const service = new Service<MyConverters>("" as any, "");

  // Should work
  await service.read("state");
  await service.read("water");
  await service.write("state", "idle");
  await service.write("water", { level: 1, initialLevel: 2 });

  // Should not work
  await service.read("XXX");
  await service.write("XXX", "idle");
  await service.write("state", "XXX");
  await service.write("water", "XXX");
})();

//type States = { [S in keyof typeof TestConverterNames]: number };

/*   enum Names {
    state,
    water
  } */
/*  type StateConverter = Con<MyConverters, "state">;

  const X: StateConverter = {
    uuid: "",
    decode: () => "idle"
  }; */

// type MyConverters2 = { [index in keyof typeof Names]: Converter<any> };
