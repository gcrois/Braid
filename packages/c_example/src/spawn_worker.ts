import initCore from "@braid/c_example/wasm";
import { WorkerWrapper } from "@braid/utils";

// @ts-expect-error TS can't infer URL
import WorkerURL from "./worker?worker&url";

export function initCoreWorker() {
	return new WorkerWrapper<Awaited<ReturnType<typeof initCore>>>({
		url: WorkerURL,
	});
}
