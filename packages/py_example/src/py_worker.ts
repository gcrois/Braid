import { initPyCore } from "./py_core";
import type { PyCore } from "./py_core";

export type WorkerRequest<T extends keyof PyCore = keyof PyCore> = {
	id: number;
	method: T;
	args: PyCore[T] extends (...args: any[]) => any
		? Parameters<PyCore[T]>
		: never;
};

try {
	(async () => {
		console.log("Worker started");
		const core = await initPyCore();
		console.log("Core initialized");
		// Signal that the module is ready.
		postMessage({ ready: true });
		addEventListener("message", async (e: MessageEvent) => {
			const { id, method, args } = e.data as WorkerRequest;
			let result;
			try {
				// if the method is not a function, return the value of the property
				if (typeof core[method] !== "function") {
					result = core[method];
				}
				// if the method is a function, call it with the arguments
				else {
					// @ts-ignore - TS can't infer that args is a tuple here
					result = await core[method](...args);
				}
			} catch (error) {
				result = error;
			}
			// Reply with the original id to match the request.
			postMessage({ id, result });
		});
	})();
} catch (error) {
	console.error("Worker error", error);
	postMessage({ error });
}
