import { test, expect, beforeAll } from "vitest";
import { initCore } from "./index.js";

const init = initCore;
let core: Awaited<ReturnType<typeof init>>;

beforeAll(async () => {
	core = await init();
});

test("fibonacci", async () => {
	const result = core._fib(10);
	expect(result).toBe(55);
});
