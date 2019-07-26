import typescript from "typescript";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescriptPlugin from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  external: ["sblendid-bindings-macos"],
  output: [
    {
      file: pkg.main,
      format: "cjs",
      preferBuiltins: true
    },
    {
      file: pkg.module,
      format: "es",
      external: ["sblendid-bindings-macos"],
      preferBuiltins: true
    }
  ],
  plugins: [resolve({ preferBuiltins: true }), commonjs(), typescriptPlugin({ typescript }), terser()]
};
