import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';

export default defineConfig({
    base: "/Braid/",
	plugins: [
		preact(),
		wasm(),
		topLevelAwait(),
		copy({
			targets: [
				{
					src: "node_modules/@braid/py_example/dist/py_worker.es.js",
					dest: ".",
				}
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
