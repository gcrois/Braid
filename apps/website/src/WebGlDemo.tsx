import { useEffect, useState } from "preact/hooks";
import { initOpenGL } from "@braid/c_example";

/**
 * WebGlDemo demonstrates the Mandelbrot fly-in from C++ (opengl_example.cpp),
 * compiled to WebAssembly via Emscripten.
 * It now launches only after clicking a button.
 */
export function WebGlDemo() {
	const [launched, setLaunched] = useState(false);
	const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(
		null,
	);
	const [status, setStatus] = useState<string>("Nothing");

	// When "launched" is true and the canvas is available, load the OpenGL module.
	useEffect(() => {
		if (launched && canvasNode) {
			initOpenGL()
				.then((module) => {
					module._main(0, 0);
					setStatus("Launched OpenGL Demo");
				})
				.catch((err) => {
					setStatus(
						"Failed to load opengl_example WASM module: " + err,
					);
					console.error(
						"Failed to load opengl_example WASM module:",
						err,
					);
				});
		}
	}, [launched, canvasNode]);

	return (
		<div style={{ textAlign: "center" }}>
			<h2>WebGL Mandelbrot Demo (C++ via Emscripten)</h2>
			<button onClick={() => setLaunched(true)}>
				{launched ? "Launched" : "Launch OpenGL Demo"}
			</button>
			{launched && (
				<canvas
					ref={setCanvasNode}
					width={512}
					height={512}
					id="canvas"
					style={{
						border: "1px solid #444",
						width: "100%",
						aspectRatio: "1 / 1",
						marginTop: "1rem",
					}}
				/>
			)}
			<p>{status}</p>
		</div>
	);
}
