import initCore from "@braid/c_example/wasm";
import { WorkerWrapper } from "@braid/utils";

export function initCoreWorker() {
    return new WorkerWrapper<Awaited<ReturnType<typeof initCore>>>(new URL("./worker.ts", import.meta.url));
}
