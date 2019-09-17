import NodeAdapter, { Params, Event } from "../../src/index";

export function first<E extends Event>(
  adapter: NodeAdapter,
  event: E
): Promise<Params<E>> {
  return new Promise(resolve => {
    const listener = (...params: Params<E>) => {
      adapter.off(event, listener);
      resolve(params);
    };
    adapter.on(event, listener);
  });
}

export async function count(
  adapter: NodeAdapter,
  event: Event,
  timeout: number,
  numEvents = 0
): Promise<number> {
  const listener = () => {
    numEvents++;
  };
  adapter.on(event, listener);
  await new Promise(resolve => setTimeout(resolve, timeout));
  adapter.off(event, listener);
  return numEvents;
}
