import { useState } from "preact/hooks";
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
		<div className="card">
			<h2>Core Execution &amp; Benchmark</h2>
			<div className="row">
				<label htmlFor="execFibInput">fib(n):</label>
				<input
					id="execFibInput"
					type="number"
					value={fibInput}
					onChange={(e) => setFibInput(e.currentTarget.value)}
				/>
			</div>
			{cores.map((core) => {
				const hasFib = core;
				return (
					<div key={core.name} className="core-exec-row">
						<h3>{core.name}</h3>
						{hasFib ? (
							<div className="row">
								<button
									onClick={() =>
										runFib(
											core.name,
											convertToFibModule(core),
										)
									}
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
								>
									Benchmark Fib
								</button>
								{results[core.name] && (
									<div className="result">
										Result: {results[core.name].value}{" "}
										<br />
										Time:{" "}
										{results[core.name].time.toFixed(
											2,
										)} ms
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
