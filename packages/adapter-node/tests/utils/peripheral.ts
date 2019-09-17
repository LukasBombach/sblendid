import { Params } from "../../src/index";

export function hasName(
  name: string,
  onFound?: (peripheral: Params<"discover">) => {}
): (...peripheral: Params<"discover">) => boolean {
  return (...peripheral) => {
    const found = peripheral[4].localName === name;
    if (found && onFound) onFound(peripheral);
    return found;
  };
}
