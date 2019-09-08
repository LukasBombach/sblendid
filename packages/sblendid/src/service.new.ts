interface Converter<T = Buffer> {
  name: string;
  uuid: CUUID;
  decode: (value: Buffer) => T;
}

type Converters = ReadonlyArray<Converter<any>>;

type Names<C extends Converters> = C[number]["name"];

type Value<
  C extends Converters,
  N extends Names<C>
> = Extract<C[number], { name: N }> extends Converter<infer V> ? V : never;

type Const<T> = <const>T;

class Service<C extends Converters> {
  private converters?: Converters;

  constructor(converters?: C) {
    this.converters = converters;
  }

  public read<N extends Names<C>>(name: N): Value<C, N> {
    if (this.converters) {
      return this.getConvertedValue(name);
    } else {
      return this.getBufferForUUID(name);
    }
  }
}

/* const infoConverter = {
  name: "info",
  uuid: "180a",
  decode: (v: Buffer) => v.toString()
} as const;

const pressureConverter = {
  name: "pressure",
  uuid: "1810",
  decode: (v: Buffer) => v.readInt32BE(0)
} as const;

const converters = [infoConverter, pressureConverter] as const; */

/* type TheNames = Names<typeof converters>; // "info" | "pressure"
type InfoValue = Value<typeof converters, "info">; // string
type PressureValue = Value<typeof converters, "pressure">; // number */
