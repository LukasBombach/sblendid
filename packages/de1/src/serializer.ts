type BufferType = "Uint8" | "Uint16" | "Uint32";
type BufferLengths = { [bufferType in BufferType]: number };

// https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
// type DataViewFunction = Pick<
//   DataView,
//   {
//     [Key in keyof DataView]: DataView[Key] extends Function ? Key : never
//   }[keyof DataView]
// >;

type Value = {
  type: BufferType;
  value: number;
  littleEndian?: boolean;
};

export default class Serializer<T> {
  private static bufferLengths: BufferLengths = {
    Uint8: 1,
    Uint16: 2,
    Uint32: 4
  };

  private values: Value[] = [];

  public char(value: number) {
    this.add("Uint8", value);
    return this;
  }

  public short(value: number) {
    this.add("Uint16", value, false);
    return this;
  }

  public int(value: number) {
    this.add("Uint16", value, true);
    return this;
  }

  public sha(value: string) {
    this.add("Uint16", parseInt(value, 16), true);
    return this;
  }

  public dataView(): DataView {
    const length = this.getBufferLength();
    const buffer = new ArrayBuffer(length);
    const dataView = new DataView(buffer);
    this.setValues(dataView);
    return dataView;
  }

  public buffer(): Buffer {
    return Buffer.from(this.dataView().buffer);
  }

  // todo bad typecasting
  private setValues(dataView: DataView, offset = 0): void {
    this.values.forEach(({ type, value, littleEndian }) => {
      const method = `set${type}` as keyof DataView;
      (dataView[method] as Function)(offset, value, littleEndian);
      offset += this.typeLength(type);
    });
  }

  private add(type: BufferType, value: number, littleEndian?: boolean): void {
    if (typeof value === "undefined") return;
    this.values.push({ type, value, littleEndian });
  }

  private getBufferLength(): number {
    return this.values
      .map(({ type }) => this.typeLength(type))
      .reduce((sum, length) => sum + length, 0);
  }

  private typeLength(type: BufferType): number {
    return Serializer.bufferLengths[type];
  }
}
