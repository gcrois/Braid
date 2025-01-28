import { useEffect, useRef } from "preact/hooks";
import { initOpenGL } from "@braid/c_example";

/**
 * WebGlDemo demonstrates the Mandelbrot fly-in from C++ (opengl_example.cpp),
 * compiled to WebAssembly via Emscripten.
 */
export function WebGlDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let canceled = false;

        (async () => {
            try {
                // 1) Load the Emscripten module for the OpenGL example
                const module = await initOpenGL();

                if (canceled) return;

                module._main(0, 0);

            } catch (err) {
                console.error("Failed to load opengl_example WASM module:", err);
            }
        })();

        return () => {
            canceled = true;
        };
    }, []);

    return (
        <div style={{ textAlign: "center" }}>
            <h2>WebGL Mandelbrot Demo (C++ via Emscripten)</h2>
            <canvas
                ref={canvasRef}
                width={512}
                height={512}
                id="canvas"
                style={{ border: "1px solid #444", width: "100%", aspectRatio: "1 / 1" }}
            />
        </div>
    );
}
