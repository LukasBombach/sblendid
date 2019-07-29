import typescript from "typescript";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescriptPlugin from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const typescriptPluginOptions = { typescript, useTsconfigDeclarationDir: true };

export default [
  {
    input: "src/index.ts",
    external: ["sblendid-bindings-macos", "events"],
    output: [
      {
        file: pkg.main,
        format: "cjs",
        preferBuiltins: true
      },
      {
        file: pkg.module,
        format: "es",
        preferBuiltins: true
      }
    ],
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      typescriptPlugin(typescriptPluginOptions),
      terser()
    ]
  },
  {
    input: "src/compat/index.ts",
    output: {
      file: "compat.js",
      format: "cjs"
    },
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      typescriptPlugin(typescriptPluginOptions)
      // terser()
    ]
  }
];
