import { describe, expect, test, beforeAll, bench } from "vitest";
import { generatePrime, generatePrimeSieve } from "./prime";
import { initCore } from ".";

const init = initCore();
let core: Awaited<typeof init>;

beforeAll(async () => {
	await init;
    core = await init;
});

const inputSizes = Array.from({ length: 4 }, (_, i) => Math.pow(10, i + 1));
describe("Prime Generation Benchmark", () => {
	inputSizes.forEach((n) => {
		bench(`generatePrimeSieve for n = ${n}`, () => {
			generatePrimeSieve(n);
		});

		bench(`generatePrimeSieveWasm for n = ${n}`, () => {
			core._generatePrimeSieve(n);
		});
	});
});

// describe("Prime Generation Wasm", () => {
// 	inputSizes.forEach((n) => {
// 		bench(`generatePrimeWasm for n = ${n}`, () => {
// 			core._generatePrime(n);
// 		});

// 		bench(`generatePrimeSieveWasm for n = ${n}`, () => {
// 			core._generatePrimeSieve(n);
// 		});
// 	})
// });
