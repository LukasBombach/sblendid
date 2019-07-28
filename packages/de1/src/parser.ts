export default class Parser<T> {
  private dataView: DataView;
  private offset: number;
  private varsInternal: any;

  constructor(data: DataView | Buffer) {
    this.dataView = this.getDataView(data);
    this.offset = 0;
    this.varsInternal = {};
  }

  public char(name: string) {
    const value = this.dataView.getUint8(this.offset);
    this.setVar(name, value);
    this.offset += 1;
    return this;
  }

  public short(name: string, divideBy = 1) {
    const value = this.dataView.getUint16(this.offset, false) / divideBy;
    this.setVar(name, value);
    this.offset += 2;
    return this;
  }

  public int(name: string) {
    const value = this.dataView.getUint32(this.offset, true);
    this.setVar(name, value);
    this.offset += 4;
    return this;
  }

  public sha(name: string) {
    const value = this.dataView.getUint32(this.offset, true).toString(16);
    const sanitizedValue = value === "0" ? "" : value;
    this.setVar(name, sanitizedValue);
    this.offset += 4;
    return this;
  }

  public vars(): T {
    return this.varsInternal;
  }

  private getDataView(data: DataView | Buffer): DataView {
    if (data instanceof DataView) return data;
    return new DataView(data.buffer);
  }

  private setVar(path: string, value: number | string) {
    const keys = path.split(".");
    const key = keys[keys.length - 1];
    let node = this.varsInternal;
    keys.slice(0, -1).forEach(function(k) {
      if (node[k] === undefined) node[k] = {};
      node = node[k];
    });
    node[key] = value;
  }
}
