import DE1 from "../src";
import { logAll } from "sblendid/debug";

(async () => {
  console.log("connecting...");
  const de1 = await DE1.connect();

  console.log("connected");
  logAll(de1.getAdapter());

  console.log("reading state...");
  const state = await de1.get("state");

  console.log("reading water level...");
  const water = await de1.getWaterlevel();

  console.log("state", state);
  console.log("water", water);

  process.exit();
})();
