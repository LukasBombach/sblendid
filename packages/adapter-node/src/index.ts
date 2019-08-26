/// <reference path="./types/global.d.ts" />

import Bindings from "./bindings";
import Adapter from "./adapter";
import Characteristic from "./characteristic";
import Peripheral from "./peripheral";

export { Params } from "./types/bindings";

export default class SblendidNodeAdapter {
  private bindings = new Bindings();
  private adapter = new Adapter(this.bindings);

  public characteristic = new Characteristic(this.adapter);
  public peripheral = new Peripheral(this.adapter);
}
