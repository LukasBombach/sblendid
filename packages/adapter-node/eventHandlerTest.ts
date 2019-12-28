import Native from "./src/native";
import Bindings from "./src/types/bindings";

type SubType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;

type NativeMethods = SubType<Bindings, Function>;

const nativeAdapter: Bindings = new Native();

(async () => {
  try {
    console.info("Starting Script");

    await nativeAdapter.init();

    // const listener = (...p: any[]) => console.log(p);
    // await native("on", "discover", listener);
    // await native("init");
    // await native("startScanning");
    // await sleep(2000);
    // await native("stopScanning");
    // await native("off", "discover", listener);

    console.info("End of Script");
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();

async function sleep(ms: number): Promise<void> {
  console.info("sleep", ms, "ms");
  return await new Promise(res => setTimeout(res, ms));
}

function native<M extends keyof NativeMethods>(
  method: M,
  ...args: Parameters<Bindings[M]>
): ReturnType<Bindings[M]> {
  console.info(method, ...args);
  return (nativeAdapter[method] as any)(...args);
}
