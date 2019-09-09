import { Converter } from "./characteristic";

export type Converters = Record<string, Converter<any>>;

type Names<C extends Converters> = keyof C;

export type Value<
  C extends Converters,
  N extends Names<C>
> = C[N] extends Converter<infer V> ? V : never;

export default class Service<C extends Converters> {
  private converters?: Converters;

  constructor(converters?: C) {
    this.converters = converters;
  }

  public async read<N extends Names<C>>(name: N): Promise<Value<C, N>> {
    throw new Error("Not implemented yet");
  }

  public async write<N extends Names<C>>(
    name: N,
    value: Value<C, N>
  ): Promise<void> {
    throw new Error("Not implemented yet");
  }
}

/* const info = {
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

const value = service.read("info");
service.write("pressure", 12); */
