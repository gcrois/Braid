import { CoreProvider } from "./coreContext";
import { CoreManager } from "./CoreManager";
import { CoreExecFibCard } from "./CoreExecFibCard";
import { LivePyExecCard } from "./LivePyExecCard";
import { useState } from "preact/hooks";
import { fib as fibTS } from "@braid/ts_example";
import { WebGlDemo } from "./WebGlDemo";
import { CollabText } from "./CollabText";
import "./App.scss";

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
			<div className="container">
				<h1>Braid WASM &amp; Pyodide Demo</h1>
				<p>
					Compare <strong>TypeScript fib</strong> to various cores.
				</p>

				{/* Core Manager with extra info */}
				<CoreManager />

				{/* Card to execute and benchmark fib for each core */}
				<CoreExecFibCard />

				{/* Card for live Python code execution */}
				<LivePyExecCard />

				{/* Existing TS Fibonacci Card */}
				<div className="card">
					<h2>Fibonacci from TS</h2>
					<div className="row">
						<label htmlFor="fibInput">fib(n):</label>
						<input
							id="fibInput"
							type="number"
							value={fibInput}
							onChange={(e) => setFibInput(e.currentTarget.value)}
						/>
						<button onClick={handleFibCompute}>Compute</button>
					</div>
					<div className="results">
						<div className="result">
							<strong>TS result</strong>
							<p>{fibResultTS === null ? "—" : fibResultTS}</p>
						</div>
					</div>
				</div>

				{/* WebGL Demo Card */}
				<div className="card">
					<WebGlDemo />
				</div>
			</div>
		</CoreProvider>
	);
}
