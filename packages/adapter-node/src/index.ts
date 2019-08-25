export { default } from "./adapter";
export { Params } from "./types/bindings";

/* const defaultProperties: Properties = {
  read: false,
  write: false,
  notify: false
}; */

/*   public static fromNoble<T>(
    service: Service,
    noble: NobleCharacteristic,
    converter?: Converter<T>
  ): Characteristic<T> {
    const properties = Object.assign({}, defaultProperties);
    for (const name of noble.properties) properties[name] = true;
    return new Characteristic(service, noble.uuid, converter, properties);
  } */
