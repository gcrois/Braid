import { test, expect, beforeAll } from "vitest";
import { initCoreNode } from "./index";

const init = initCoreNode;
let core: Awaited<ReturnType<typeof init>>;

beforeAll(async () => {
    console.log(init);
	core = await init();
});

test("fibonacci", async () => {
	const result = core.fib(10);
	expect(result).toBe(55);
});
