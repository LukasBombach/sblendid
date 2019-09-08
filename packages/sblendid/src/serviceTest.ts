/* // type BluetoothCharacteristicUUID = number | string;

// type CUUID = number | string;

interface Converter<T = Buffer> {
  name: string;
  uuid: CUUID;
  decode: (value: Buffer) => T;
}

type Converters = Converter<any>[];
type NameOrCUUID<C> = C extends Converters ? Name<C> : CUUID;

const convertersTest: Converters = [
  {
    name: "info",
    uuid: "180a",
    decode: (v: Buffer) => v.toString()
  },
  {
    name: "pressure",
    uuid: "1810",
    decode: (v: Buffer) => v.readInt32BE(0)
  }
];

type Name<C extends Converters> = "info" | "pressure";
type Value<C, N extends NameOrCUUID<C>> = "" | Buffer;

class Service<C> {
  private converters?: Converters;

  constructor(converters?: C) {
    this.converters = converters as any; // Ask on StackOverflow
  }

  public read<N extends NameOrCUUID<C>>(name: N): Value<C, N> {
    if (this.converters) {
      return this.getConvertedValue(name);
    } else {
      return this.getBufferForUUID(name);
    }
  }

  private getBufferForUUID(uuid: CUUID): Buffer {
    return Buffer.from("Foobar", "utf8"); // Dummy Code
  }

  private getConvertedValue<N extends NameOrCUUID<C>>(name: N): Value<C, N> {
    return "Foobar"; // Dummy Code
  }
}

const infoConverter: Converter<string> = {
  name: "info",
  uuid: "180a",
  decode: v => v.toString()
};

const pressureConverter: Converter<number> = {
  name: "pressure",
  uuid: "1810",
  decode: v => v.readInt32BE(0)
};

const converters: Converters = [infoConverter, pressureConverter];

const service = new Service(converters);
const info = service.read("info");

const service2 = new Service();
const info2 = service2.read("180a");
 */
