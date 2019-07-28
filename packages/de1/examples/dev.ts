import DE1 from "../src";
import { logAll } from "sblendid/debug";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log("connecting...");
  const de1 = await DE1.connect();

  // Log all events
  // logAll(de1.getAdapter());

  // Listening for events
  de1.on("state", (...args: any[]) => console.log("new state", args));

  console.log("reading state...");
  console.log("State is now:", await de1.get("state"));

  console.log("turning on...");
  await de1.turnOn();
  console.log("State is now:", await de1.get("state"));

  console.log("turning off...");
  await de1.turnOff();
  console.log("State is now:", await de1.get("state"));

  console.log("disconnecting...");
  await de1.disconnect();
  process.exit();
})();
