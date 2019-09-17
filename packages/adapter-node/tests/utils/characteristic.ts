import NodeAdapter from "../../src/index";
import { Properties } from "../../src/characteristic";

export async function findCharacteristic(
  adapter: NodeAdapter,
  puuid: PUUID,
  property: keyof Properties
): Promise<[SUUID, CUUID] | undefined> {
  const services = await adapter.getServices(puuid);
  for (const suuid of services) {
    const characteristicData = await adapter.getCharacteristics(puuid, suuid);
    for (const { uuid, properties } of characteristicData) {
      if (properties[property]) return [suuid, uuid];
    }
  }
}
