interface Converter<T = Buffer> {
  uuid: CUUID;
  decode?: (value: Buffer) => Promish<T>;
  encode?: (value: T) => Promish<Buffer>;
}

type Converters = Record<string, Converter<any>>;
type MaybeConverters = Converters | undefined;

type Names<C extends MaybeConverters> = C extends Converters ? keyof C : CUUID;

type PickConverter<
  C extends MaybeConverters,
  N extends Names<C>
> = C extends Converters ? (N extends keyof C ? C[N] : undefined) : undefined;

type Value<C extends MaybeConverters, N extends Names<C>> = PickConverter<
  C,
  N
> extends Converter<infer V>
  ? V
  : Buffer;

/**
 * Tests
 */

type MyConverters = {
  manufacturer: Converter<string>;
  model: Converter<number>;
};

const converters: MyConverters = {
  manufacturer: {
    uuid: "2a29",
    decode: (buffer: Buffer) => buffer.toString()
  },
  model: {
    uuid: "2a24",
    decode: (buffer: Buffer) => buffer.readInt16BE(0)
  }
};

const a: Names<MyConverters> = "model";
const b: Names<undefined> = "model";

const f: Value<MyConverters, "model"> = 2;
const g: Value<undefined, "model"> = Buffer.from("");

const x: PickConverter<MyConverters, "model"> = converters.model;
const y: PickConverter<undefined, "model"> = undefined;
