import { defineConfig } from 'vite';
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		outDir: 'dist',
        lib: {
			entry: {
                index: "src/index.ts",
                py_worker: "src/py_worker.ts",
            },
			name: "py_example",
			fileName: (format, entryName) => `${entryName}.${format}.js`,
			formats: ["es"],
		},
        assetsInlineLimit: 0,
	},
    plugins: [
        dts(),
        copy({
			targets: [
				{
					src: "../../node_modules/pyodide/pyodide*",
					dest: ".",
				},
				{
					src: "../../node_modules/pyodide/python_stdlib.zip",
					dest: ".",
				},
			],
		}),
    ],
    worker: {
        format: "es"
    }
});
