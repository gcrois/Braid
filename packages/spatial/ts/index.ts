import { MainModule as CoreT, EmbindModule } from "../build/interface";

/* @ts-expect-error */
import createSpatial from "../build/spatial_hash.js";

export function initSpatial(): Promise<EmbindModule & CoreT> {
	return createSpatial() as Promise<EmbindModule & CoreT>;
}
