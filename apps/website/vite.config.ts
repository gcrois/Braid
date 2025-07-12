import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy as copy } from "vite-plugin-static-copy";

export default defineConfig({
	base: "/Braid/",
	plugins: [
		react(),
        tailwindcss(),
		wasm(),
		topLevelAwait(),
		copy({
			targets: [
				{
					src: "node_modules/@braid/py_example/dist/py_worker.*",
					dest: "assets",
				},
				{
					src: "../../node_modules/pyodide/pyodide*",
					dest: "assets",
				},
				{
					src: "../../node_modules/pyodide/python_stdlib.zip",
					dest: "assets",
				},
			],
		}),
	],
	worker: {
		format: "es",
	},
	build: {
		sourcemap: true,
		assetsInlineLimit: 0,
	},
});
