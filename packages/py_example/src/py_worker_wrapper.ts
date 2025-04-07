import { WorkerWrapper } from "@braid/utils";
import type { PyCore } from "./py_core";

export function initCoreWorker() {
	// In rollup, we use a direct path to the worker file
	const workerUrl = new URL("./py_worker.js", import.meta.url).href;
	return new WorkerWrapper<PyCore>({ url: workerUrl });
}
