import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
    plugins: [preact()],
    build: {
        lib: {
            // The entry file of your web component
            entry: "src/index.ts",
            // A global name if someone uses <script> in an older environment
            // but for ESM usage, it's not as crucial.
            name: "MyBraidWC",
            // The file name patterns (no hash). We'll output in ESM format only:
            fileName: "my-wc",
            formats: ["es"]
        },
        rollupOptions: {
            // If you want truly everything in the final build, do not mark any external here.
            // If you'd prefer some libs to remain external, you'd put them here.
            external: []
        },
        // This ensures minimal chunk-splitting. You can tweak as needed.
        // The final output is easy to load from a single script.
        minify: "esbuild"
    }
});
