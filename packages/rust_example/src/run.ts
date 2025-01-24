import * as core from "@braid/rust_example/node";

async function runWASM() {
	const result = core.main();
	return result;
}

async function run() {
	// console.log("Running JS module...");
	// const js = await runJS();
	// console.log(`JS module returned: ${js}`);

	// console.log("\n===\n");

	console.log("Running WASM module...");
	const wasm = await runWASM();
	console.log(`WASM module returned: ${wasm}`);
}

run();
