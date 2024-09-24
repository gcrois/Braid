import { MainModule as CoreT, EmbindModule } from "../build/interface";

/* @ts-expect-error */
import createCore from "../build/core.js";

export function initCore(): EmbindModule & CoreT {
	const core = createCore() as EmbindModule & CoreT;
	return core;
}
