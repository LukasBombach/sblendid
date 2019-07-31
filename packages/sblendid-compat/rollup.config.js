import typescript from "typescript";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescriptPlugin from "rollup-plugin-typescript2";
import pkg from "./package.json";
// import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    file: pkg.main,
    format: "cjs"
  },
  external: ["module-alias"],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescriptPlugin({ typescript })
    // terser()
  ]
};
