export interface Converter<T = Buffer> {
  uuid: CUUID;
  decode?: (value: Buffer) => Promish<T>;
  encode?: (value: T) => Promish<Buffer>;
}

export interface Properties {
  read?: boolean;
  write?: boolean;
  notify?: boolean;
}

export type Listener<C extends Converter<any>> = (
  value: T
) => Promise<void> | void;

export default class Characteristic<C extends Converter<any>> {
  public uuid: CUUID;
  public properties: Properties;
  private converter?: C;

  constructor(uuid: CUUID, properties: Properties = {}, converter?: C) {
    this.uuid = uuid;
    this.properties = properties;
    this.converter = converter;
  }

  public async read(): Promise<T> {}

  public async write(value: T, withoutResponse?: boolean): Promise<void> {}

  public async on(event: "notify", listener: Listener<T>): Promise<void> {}

  public async off(event: "notify", listener: Listener<T>): Promise<void> {}
}
