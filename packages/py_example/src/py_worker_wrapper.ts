import { initPyCore } from "./py_core";
import { WorkerWrapper } from "@braid/utils";

export function initCoreWorker() {
    const url = new URL("./py_worker.es.js", import.meta.url);
    console.log(url);
    return new WorkerWrapper<Awaited<ReturnType<typeof initPyCore>>>({url});
}