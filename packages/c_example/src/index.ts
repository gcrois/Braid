import createCore from "@braid/c_example/wasm";

export function initCore() {
	const core = createCore();
	return core;
}
