import ExtendedEventEmitter from "./extendedEventEmitter";

export default class Adapter extends ExtendedEventEmitter {
  public async init() {}
  public async startScanning() {}
  public async stopScanning() {}
  public async connect() {}
  public async disconnect() {}
  public async updateRssi() {}
  public async discoverServices() {}
  public async discoverIncludedServices() {}
  public async discoverCharacteristics() {}
  public async read() {}
  public async write() {}
  public async notify() {}
  public async discoverDescriptors() {}
  public async readValue() {}
  public async writeValue() {}
  public async readHandle() {}
  public async writeHandle() {}
  public async stop() {}
}

// This is for debugging while development
// const adapter = new Adapter();
// adapter.on("stateChange", () => {});
