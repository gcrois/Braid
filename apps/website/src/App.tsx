import React from "react";
import { CoreProvider } from "./coreContext";
import { CoreManager } from "./CoreManager";
import { CoreExecFibCard } from "./CoreExecFibCard";
import { LivePyExecCard } from "./LivePyExecCard";
import { useState } from "react";
import { fib as fibTS } from "@braid/ts_example";
import { WebGlDemo } from "./WebGlDemo";


export function App() {
	const [fibInput, setFibInput] = useState("10");
	const [fibResultTS, setFibResultTS] = useState<number | null>(null);

	async function handleFibCompute() {
		const n = parseInt(fibInput, 10);
		if (isNaN(n)) return;
		setFibResultTS(fibTS(n));
	}

	return (
		<CoreProvider>
			<div className="mx-auto max-w-[600px] p-4 text-[var(--typography-body)] bg-[var(--color-base03)] min-h-full box-border">
				<h1 className="mb-2 text-[var(--typography-headings)]">Braid WASM</h1>

				{/* Core Manager with extra info */}
				<CoreManager />

				{/* Card to execute and benchmark fib for each core */}
				<CoreExecFibCard />

				{/* Card for live Python code execution */}
				<LivePyExecCard />

				{/* Existing TS Fibonacci Card */}
				<div className="bg-[var(--color-base02)] rounded-lg p-4 mb-4 shadow-md border border-[var(--color-base01)] border-opacity-30">
					<h2 className="mb-2 text-[var(--typography-headings)]">Fibonacci from TS</h2>
					<div className="flex items-center gap-2">
						<label htmlFor="fibInput">fib(n):</label>
						<input
							id="fibInput"
							type="number"
							value={fibInput}
							onChange={(e) => setFibInput(e.currentTarget.value)}
							className="w-20 py-1 px-2 rounded border border-[var(--color-base01)] bg-[var(--color-base02)] text-[var(--typography-body)]"
						/>
						<button 
							onClick={handleFibCompute}
							className="cursor-pointer bg-[var(--color-blue)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--typography-links)]"
						>
							Compute
						</button>
					</div>
					<div className="flex gap-4 mt-2">
						<div className="flex-1 p-3 bg-[var(--color-base01)] bg-opacity-20 text-center rounded">
							<strong className="block mb-1">TS result</strong>
							<p className="m-0 text-lg">{fibResultTS === null ? "—" : fibResultTS}</p>
						</div>
					</div>
				</div>

				{/* WebGL Demo Card */}
				<div className="bg-[var(--color-base02)] rounded-lg p-4 mb-4 shadow-md border border-[var(--color-base01)] border-opacity-30">
					<WebGlDemo />
				</div>
			</div>
		</CoreProvider>
	);
}
