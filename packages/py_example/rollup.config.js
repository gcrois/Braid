/** @type {import('rollup').RollupOptions} */

import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

const commonPlugins = [
	nodeResolve({
		browser: true,
		preferBuiltins: false,
	}),
	commonjs(),
	typescript({
		tsconfig: "./tsconfig.json",
		sourceMap: true,
	}),
	// Bundle .py files as strings
	string({
		include: "**/*.py",
	}),
	terser(),
	copy({
		targets: [
			{ src: "../../node_modules/pyodide/pyodide*", dest: "dist" },
			{
				src: "../../node_modules/pyodide/python_stdlib.zip",
				dest: "dist",
			},
		],
	}),
];

export default [
	// Main entry bundle
	{
		input: "src/index.ts",
		output: {
			file: "dist/index.js",
			format: "es",
			sourcemap: true,
		},
		external: ["pyodide", "@braid/utils"],
		plugins: commonPlugins,
	},

	// Worker bundle with browser-friendly configuration
	{
		input: "src/py_worker.ts",
		output: {
			file: "dist/py_worker.js",
			format: "es",
			sourcemap: true,
			inlineDynamicImports: true,
		},
		plugins: commonPlugins,
	},

	// Type definitions
	{
		input: "src/index.ts",
		output: {
			file: "dist/index.d.ts",
			format: "es",
		},
		plugins: [dts()],
	},
	{
		input: "src/py_worker.ts",
		output: {
			file: "dist/py_worker.d.ts",
			format: "es",
		},
		plugins: [dts()],
	},
];
