import initWasm from "@braid/rust_example/wasm";
import * as coreJS from "@braid/rust_example/js";

export function initCoreJS() {
    return coreJS;
}

export async function initCoreWasm() {
    const core = await initWasm();
    return core;
}