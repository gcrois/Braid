import { MainModule as CoreT, EmbindModule } from "../build/interface";

/* @ts-expect-error */
import createCore from "../build/core.js";

export interface Options {
}

// Function to initialize the module, either via asset URL or fallback to core.js
export async function initCore(
	options?: Options,
): Promise<EmbindModule & CoreT> {
	return new Promise((resolve) => {
		const core = createCore() as EmbindModule & CoreT & EmscriptenModule;
        resolve(core);
	});
}
