import { test, expect } from "vitest";
import { fib } from "./fib";

test("fib(10) should return 55", () => {
    expect(fib(10)).toBe(55);
});
