import { useEffect, useState } from "react";
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
		<div className="text-center">
			<h2 className="mb-2 text-[var(--typography-headings)]">WebGL Mandelbrot Demo (C++ via Emscripten)</h2>
			<button 
				onClick={() => setLaunched(true)}
				className="cursor-pointer bg-[var(--color-green)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--color-blue)]"
			>
				{launched ? "Launched" : "Launch OpenGL Demo"}
			</button>
			{launched && (
				<canvas
					ref={setCanvasNode}
					width={512}
					height={512}
					id="canvas"
					className="border border-[var(--color-base01)] w-full aspect-square mt-4"
				/>
			)}
			<p className="mt-2 text-[var(--typography-body)]">{status}</p>
		</div>
	);
}
