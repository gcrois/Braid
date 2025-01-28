import createCore from "@braid/c_example/wasm";
import createOpenGL from "@braid/c_example/wasm-opengl";

export function initCore() {
	const core = createCore();
	return core;
}

export function initOpenGL() {
	const opengl = createOpenGL();
	return opengl;
}