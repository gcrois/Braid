import initCore from "@braid/c_example/wasm";

(async () => {
	const core = await initCore();
	// Signal that the module is ready.
	postMessage({ ready: true });
	addEventListener("message", async (e: any) => {
		const { id, method, args } = e.data;
		let result;
		try {
			// Always call the method on core.
			// @ts-ignore-error: TS can't infer that args is a tuple here, but it's safe.
			result = (core[method] as CallableFunction)(...args);
		} catch (error) {
			result = error;
		}
		// Reply with the original id to match the request.
		postMessage({ id, result });
	});
})();
