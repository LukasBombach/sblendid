/// <reference path="./src/types/global.d.ts" />
import Bindings from "./src/bindings";

(async () => {
  const bindings = new Bindings();

  bindings.on("stateChange", state => console.log("new state:", state));

  console.log("init");
  bindings.init();

  console.log("wait");
  await new Promise(res => setTimeout(res, 3000));

  console.log("stop");
  bindings.stop();

  // console.log("wait");
  // await new Promise(res => setTimeout(res, 3000));

  console.log("done");
})();
