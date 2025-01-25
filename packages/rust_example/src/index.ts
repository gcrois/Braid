export function initCoreNode() {
    return import("@braid/rust_example/node");
}

export async function initCoreWasm() {
    const core = (await import("@braid/rust_example/wasm")).default();
    return core;
}