import { MainModule as CoreT, EmbindModule } from "../build/interface";

export interface Options {
	assetUrl?: string;
}

// Function to initialize the module, either via asset URL or fallback to core.js
export async function initCore(
	options?: Options,
): Promise<EmbindModule & CoreT> {
	if (options?.assetUrl) {
		try {
			// Try to stream-compile the WASM using instantiateStreaming
			const wasmModule = await WebAssembly.instantiateStreaming(
				fetch(options.assetUrl),
                {}
			);
			return wasmModule.instance.exports as unknown as EmbindModule &
				CoreT;
		} catch (error) {
			console.warn(
				"Failed to load WASM from asset URL, falling back to core.js:",
				error,
			);
		}
	}

	// Dynamically import _CoreModule only if no assetUrl or if assetUrl fails
	const _CoreModule = (await import("../build/core.js")).default;
	
	// Fallback to core.js
	return new Promise((resolve) => {
		const core = _CoreModule as EmbindModule & CoreT & EmscriptenModule;
		core.onRuntimeInitialized = () => resolve(core);
	});
}
