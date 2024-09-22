import { test, expect, beforeAll } from "vitest";
import { initCore } from ".";

const init = initCore();
let core: Awaited<typeof init>;

beforeAll(async () => {
	await init;
    core = await init;
});

test("multiply native", () => {
	expect(2 * 3).toBe(6);
});

test("multiply via WASM", async () => {
	// Assuming the exported multiply function from WASM is named `multiply`
	const result = core._multiply(2, 3);

	expect(result).toBe(6);
});

test("generate prime", async () => {
	// Assuming the exported multiply function from WASM is named `multiply`
	const result = core._generatePrime(1000);

	expect(result).toBe(7919);
});
