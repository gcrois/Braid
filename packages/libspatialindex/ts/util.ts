import { SpatialHash } from "../build/interface";

export function vector_to_array(
	wasm_vector: ReturnType<SpatialHash["queryBox"]>,
): number[] {
	const out = [];
	for (let i = 0; i < wasm_vector.size(); i++) {
		out.push(wasm_vector.get(i)!);
	}
	return out;
}
