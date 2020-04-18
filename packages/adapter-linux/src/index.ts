import Scanner from "./scanner";
import type { Adapter } from "@sblendid/types/adapter";

export default class LinuxAdapter implements Adapter {
  private scanner = new Scanner();

  async init(): Promise<void> {}

  async startScanning(): Promise<void> {
    await this.scanner.startScanning();
  }

  async stopScanning(): Promise<void> {
    await this.scanner.stopScanning();
  }
}
