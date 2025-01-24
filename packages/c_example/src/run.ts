import createCoreJS from "../build/js/core.mjs";
import createCoreWASM from "@braid/c_example/wasm";

async function runJS() {
	const module = await createCoreJS();
	const result = module._main(0, 0);
	return result;
}

async function runWASM() {
	const module = await createCoreWASM();
	const result = module._main(0, 0);
	return result;
}

async function run() {
	console.log("Running JS module...");
	const js = await runJS();
	console.log(`JS module returned: ${js}`);

	console.log("\n===\n");

	console.log("Running WASM module...");
	const wasm = await runWASM();
	console.log(`WASM module returned: ${wasm}`);
}

run();
