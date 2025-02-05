/** @type {import('rollup').RollupOptions} */

import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { importAsString } from "rollup-plugin-string-import";
import copy from "rollup-plugin-copy";

export default {
	input: {
		index: "src/index.ts",
		py_worker: "src/py_worker.ts",
	},
	output: {
		dir: "dist",
		format: "esm",
		sourcemap: true,
		entryFileNames: "[name].js",
	},
	plugins: [
		resolve(),
		commonjs(),
		typescript({ tsconfig: "./tsconfig.json" }),
		importAsString({
			include: ["**/*.py"],
		}),
		copy({
			targets: [
				{
					src: "../../node_modules/pyodide/pyodide*",
					dest: "dist",
				},
				{
					src: "../../node_modules/pyodide/python_stdlib.zip",
					dest: "dist",
				},
			],
		}),
	],
};
