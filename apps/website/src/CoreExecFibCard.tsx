import { useState } from "react";
import {
	CCoreWorker,
	CoreData,
	RustCoreWorker,
	useCoreContext,
} from "./coreContext";

type FibFunc = (n: number) => Promise<number>;

function convertToFibModule(core: CoreData): FibFunc {
	if (core.name === "C Core") {
		return (n: number) => (core.module as CCoreWorker).call("_fib", n);
	} else {
		return (n: number) => (core.module as RustCoreWorker).call("fib", n);
	}
}

export function CoreExecFibCard() {
	const { cores } = useCoreContext();
	const [fibInput, setFibInput] = useState("10");
	const [results, setResults] = useState<
		Record<string, { value: string; time: number }>
	>({});

	async function runFib(coreName: string, fibFunc: FibFunc) {
		const n = parseInt(fibInput, 10);
		if (isNaN(n)) return;
		const start = performance.now();
		const result = await fibFunc(n);
		const time = performance.now() - start;
		console.log("result", result);
		setResults((prev) => ({
			...prev,
			[coreName]: { value: `${result}`, time },
		}));
	}

	async function benchmarkFib(coreName: string, fibFunc: FibFunc) {
		const n = parseInt(fibInput, 10);
		if (isNaN(n)) return;
		const iterations = 50;
		let total = 0;
		let lastResult: any;

		const start = performance.now();
		for (let i = 0; i < iterations; i++) {
			lastResult = await fibFunc(n);
		}
		total += performance.now() - start;

		setResults((prev) => ({
			...prev,
			[coreName]: {
				value: `${lastResult} (${iterations} times)`,
				time: total,
			},
		}));
	}

	return (
		<div className="bg-[var(--color-base02)] rounded-lg p-4 mb-4 shadow-md border border-[var(--color-base01)] border-opacity-30">
			<h2 className="mb-2 text-[var(--typography-headings)]">Core Execution &amp; Benchmark</h2>
			<div className="flex items-center gap-2">
				<label htmlFor="execFibInput">fib(n):</label>
				<input
					id="execFibInput"
					type="number"
					value={fibInput}
					onChange={(e) => setFibInput(e.currentTarget.value)}
					className="w-20 py-1 px-2 rounded border border-[var(--color-base01)] bg-[var(--color-base03)] text-[var(--typography-body)]"
				/>
			</div>
			{cores.map((core) => {
				const hasFib = core;
				return (
					<div key={core.name} className="mt-4 mb-3">
						<h3 className="text-[var(--typography-headings)] font-medium">{core.name}</h3>
						{hasFib ? (
							<div className="flex items-center gap-2">
								<button
									onClick={() =>
										runFib(
											core.name,
											convertToFibModule(core),
										)
									}
									className="cursor-pointer bg-[var(--color-blue)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--typography-links)]"
								>
									Run Fib
								</button>
								<button
									onClick={() =>
										benchmarkFib(
											core.name,
											convertToFibModule(core),
										)
									}
									className="cursor-pointer bg-[var(--color-orange)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--typography-links-hover)]"
								>
									Benchmark Fib
								</button>
								{results[core.name] && (
									<div className="flex-1 ml-2 p-3 bg-[var(--color-base01)] bg-opacity-20 text-center rounded">
										<span className="font-medium">Result:</span> {results[core.name].value}{" "}
										<br />
										<span className="font-medium">Time:</span>{" "}
										{results[core.name].time.toFixed(2)} ms
									</div>
								)}
							</div>
						) : (
							<p>fib method not available</p>
						)}
					</div>
				);
			})}
		</div>
	);
}
