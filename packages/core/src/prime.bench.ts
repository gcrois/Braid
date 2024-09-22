import { describe, expect, test, beforeAll, bench } from "vitest";
import { initCore } from ".";

const init = initCore();
let core: Awaited<typeof init>;

beforeAll(async () => {
	await init;
    core = await init;
});

describe("Prime Generation Benchmark", () => {
	const inputSizes = [10, 50, 100, 1000];

	inputSizes.forEach((n) => {
		bench(`generatePrime for n = ${n}`, () => {
			core._generatePrime(n);
		});

		bench(`generatePrimeSieve for n = ${n}`, () => {
			core._generatePrimeSieve(n);
		});
	});
});
