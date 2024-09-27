import { MainModule as CoreT, EmbindModule } from "../build/spatialindex_wasm";
import createSpatial from "../build/spatialindex_wasm";

export function initSpatial(): Promise<EmbindModule & CoreT> {
	return createSpatial() as Promise<EmbindModule & CoreT>;
}
