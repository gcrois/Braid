import { test, expect, beforeAll } from "vitest";
import { initCoreJS } from "./index.js";

const init = initCoreJS;
let core: Awaited<ReturnType<typeof init>>;

beforeAll(async () => {
    console.log(init);
	core = await init();
});

test("fibonacci", async () => {
	const result = core.fib(10);
	expect(result).toBe(55);
});
