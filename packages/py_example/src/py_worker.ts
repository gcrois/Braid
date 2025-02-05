import { initPyCore } from "./py_core";

(async () => {
	const core = await initPyCore();
	// Signal that the core is ready.
	postMessage({ ready: true });

	addEventListener("message", async (e: MessageEvent<any>) => {
		const { id, method, args } = e.data;
		let result;
		try {
			// Call the specified method on core.
			result = (core[method as keyof typeof core] as CallableFunction)(
				...args,
			);
		} catch (error) {
			result = error;
		}
		// Reply with the result.
		postMessage({ id, result });
	});
})();
