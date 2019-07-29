import typescript from "typescript";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescriptPlugin from "rollup-plugin-typescript2";
// import { terser } from "rollup-plugin-terser";

export default {
  input: "compat/index.ts",
  output: {
    file: "lib/compat.js",
    format: "cjs"
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescriptPlugin({ typescript })
    // terser()
  ]
};
