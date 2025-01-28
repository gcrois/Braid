import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
    plugins: [preact()],
    build: {
        lib: {
            entry: "src/index.ts",
            name: "MyBraidWC",
            fileName: "my-wc",
            formats: ["es"]
        },
        rollupOptions: {
            external: []
        },
        minify: "esbuild"
    }
});
