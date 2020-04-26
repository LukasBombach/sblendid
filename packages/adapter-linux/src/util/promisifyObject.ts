import util from "util";

type PromisifiedFunction<T extends CallableFunction> = T extends (
  callback: (err: Error) => void
) => void
  ? () => Promise<void>
  : never;

type Promisified<T> = {
  [K in keyof T]: T[K] extends CallableFunction
    ? PromisifiedFunction<T[K]>
    : never;
};

type Obj = Record<string, CallableFunction>;

type Promisify = <N extends string, F extends CallableFunction>([name, fn]: [
  N,
  F
]) => [N, PromisifiedFunction<F>];

export default function promisifyObject<T extends Obj>(obj: T): Promisified<T> {
  const promisify: Promisify = ([name, fn]) => [
    name,
    util.promisify(fn.bind(obj)),
  ];
  const entries = Object.entries(obj).map(promisify);
  return entries.reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {} as Promisified<T>
  );
}
