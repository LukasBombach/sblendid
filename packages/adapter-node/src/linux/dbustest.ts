import { promisify } from "util";

type Methods = Record<string, (...args: any[]) => void>;

const methods = {
  foo: (callback: (err: Error) => void) => {},
  bar: (arg1: string, callback: (err: Error, result: string) => void) => {},
  baz: (
    arg1: string,
    arg2: number,
    callback: (err: Error, result: boolean) => void
  ) => {},
};

const foo = promisify(methods.foo);
const bar = promisify(methods.bar);
const baz = promisify(methods.baz);
