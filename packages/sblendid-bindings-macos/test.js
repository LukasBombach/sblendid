const bindings = require("./index").bindings;

console.log(bindings);

bindings.on("stateChange", state => {
  if (state === "poweredOn") {
    console.log("state is poweredOn");
    bindings.startScanning();
  }
});

bindings.on("discover", (...args) => {
  console.log("discovered", args);
});

console.log("calling init");
bindings.init();
