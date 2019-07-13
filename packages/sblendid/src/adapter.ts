import util from "util";
import Bindings from "../types/bindings";

export type Adapter = UnboundAdapter & Bindings;

export default class UnboundAdapter {
  static withBindings(bindings: Bindings): Adapter {
    util.inherits(UnboundAdapter, bindings);
    return (UnboundAdapter as any) as Adapter;
  }
}
