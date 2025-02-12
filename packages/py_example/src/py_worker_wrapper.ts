import { initPyCore, PyCore } from "./py_core";
import { WorkerWrapper } from "./WorkerWrapper";

export function initCoreWorker() {
    return new WorkerWrapper<Awaited<ReturnType<typeof initPyCore>>>(new URL("./py_worker.js", import.meta.url));
}