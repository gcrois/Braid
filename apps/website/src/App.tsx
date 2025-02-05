import { useState } from "preact/hooks";

// Existing imports for C, Rust, TS cores
import { createCoreWorker as createCCore } from "@braid/c_example/wasm-worker";
import { createCoreWorker as createRustCore } from "@braid/rust_example/wasm-worker";
import { fib as fibTS } from "@braid/ts_example";

// New imports for Pyodide core
import { initPyCore, createPyWorker } from "@braid/py_example";

import { add } from "@braid/utils";

import "./App.scss";
import { CollabText } from "./CollabText";
import { WebGlDemo } from "./WebGlDemo";
import { ChangeEvent } from "preact/compat";

interface CoreItem {
	name: string;
	loaded: boolean;
	load: () => Promise<void>;
	unload: () => void;
	// flag for worker mode
	loadInWorker: boolean;
	setLoadInWorker: (value: boolean) => void;
}

export function App() {
	// Core instances
	const [cModule, setCModule] = useState<any | null>(null);
	const [rustModule, setRustModule] = useState<any | null>(null);
	const [pyModule, setPyModule] = useState<any | null>(null);

	// Worker flags (default true)
	const [cInWorker, setCInWorker] = useState(true);
	const [rustInWorker, setRustInWorker] = useState(true);
	const [pyInWorker, setPyInWorker] = useState(true);

	// Fibonacci input and results
	const [fibInput, setFibInput] = useState("10");
	const [fibResultTS, setFibResultTS] = useState<number | null>(null);
	const [fibResultC, setFibResultC] = useState<number | null>(null);
	const [fibResultRust, setFibResultRust] = useState<number | null>(null);
	const [fibResultPy, setFibResultPy] = useState<number | null>(null);

	// Simple add
	const [nums, setNums] = useState({ a: "5", b: "3" });
	const sum = add(parseInt(nums.a || "0", 10), parseInt(nums.b || "0", 10));

	// --- Core Loader functions ---
	async function loadCCore(): Promise<void> {
		if (!cModule) {
			const core = createCCore();
			await core.ready;
			setCModule(core);
		}
	}
	function unloadCCore(): void {
		cModule?.kill();
		setCModule(null);
	}

	async function loadRustCore(): Promise<void> {
		if (!rustModule) {
			const core = createRustCore();
			await core.ready;
			setRustModule(core);
		}
	}
	function unloadRustCore(): void {
		rustModule?.kill();
		setRustModule(null);
	}

	async function loadPyCore(): Promise<void> {
		if (!pyModule) {
			if (pyInWorker) {
				const core = createPyWorker();
				await core.ready;
				setPyModule(core);
			} else {
				const core = await initPyCore();
				setPyModule(core);
			}
		}
	}
	function unloadPyCore(): void {
		if (pyModule && typeof pyModule.kill === "function") {
			pyModule.kill();
		}
		setPyModule(null);
	}

	// --- Core Manager UI ---
	const coreItems: CoreItem[] = [
		{
			name: "C Core",
			loaded: cModule !== null,
			load: loadCCore,
			unload: unloadCCore,
			loadInWorker: cInWorker,
			setLoadInWorker: setCInWorker,
		},
		{
			name: "Rust Core",
			loaded: rustModule !== null,
			load: loadRustCore,
			unload: unloadRustCore,
			loadInWorker: rustInWorker,
			setLoadInWorker: setRustInWorker,
		},
		{
			name: "Pyodide Core",
			loaded: pyModule !== null,
			load: loadPyCore,
			unload: unloadPyCore,
			loadInWorker: pyInWorker,
			setLoadInWorker: setPyInWorker,
		},
	];

	// --- Fibonacci computation handler ---
	async function handleFibCompute(): Promise<void> {
		const n = parseInt(fibInput, 10);
		if (isNaN(n)) return;
		// TS version (synchronous)
		setFibResultTS(fibTS(n));

		// C core (WASM worker)
		await loadCCore();
		if (cModule) {
			const result = await cModule._fib(n);
			setFibResultC(result);
		}

		// Rust core (WASM worker)
		await loadRustCore();
		if (rustModule) {
			const result = await rustModule.fib(n);
			setFibResultRust(result);
		}

		// Pyodide core (either main-thread or worker)
		await loadPyCore();
		if (pyModule) {
			const result = await pyModule.fib(n);
			setFibResultPy(result);
		}
	}

	function handleNumChange(
		e: ChangeEvent<HTMLInputElement>,
		key: "a" | "b",
	): void {
		setNums((old) => ({ ...old, [key]: e.currentTarget.value }));
	}

	// --- Render ---
	return (
		<div className="container">
			<h1>Braid WASM & Pyodide Demo</h1>
			<p>
				Compare <strong>TypeScript fib</strong> to{" "}
				<strong>C fib</strong>, <strong>Rust fib</strong> and now{" "}
				<strong>Pyodide fib</strong>.
			</p>

			{/* Core Manager */}
			<div className="card">
				<h2>Core Manager</h2>
				<table>
					<thead>
						<tr>
							<th>Core</th>
							<th>Status</th>
							<th>Worker?</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{coreItems.map((core) => (
							<tr key={core.name}>
								<td>{core.name}</td>
								<td>{core.loaded ? "Loaded" : "Not Loaded"}</td>
								<td>
									<label>
										<input
											type="checkbox"
											checked={core.loadInWorker}
											onChange={(e) =>
												core.setLoadInWorker(
													e.currentTarget.checked,
												)
											}
										/>
										In Worker
									</label>
								</td>
								<td>
									{core.loaded ? (
										<button onClick={core.unload}>
											Unload
										</button>
									) : (
										<button onClick={core.load}>
											Load
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Fibonacci Card */}
			<div className="card">
				<h2>Fibonacci from TS / C / Rust / Py</h2>
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
					<div className="result">
						<strong>C result</strong>
						<p>{fibResultC === null ? "—" : fibResultC}</p>
					</div>
					<div className="result">
						<strong>Rust result</strong>
						<p>{fibResultRust === null ? "—" : fibResultRust}</p>
					</div>
					<div className="result">
						<strong>Py result</strong>
						<p>{fibResultPy === null ? "—" : fibResultPy}</p>
					</div>
				</div>
			</div>

			{/* Simple Add Card */}
			<div className="card">
				<h2>Simple Add (from @braid/utils)</h2>
				<div className="row">
					<input
						type="number"
						value={nums.a}
						onChange={(e) => handleNumChange(e, "a")}
					/>
					<span>+</span>
					<input
						type="number"
						value={nums.b}
						onChange={(e) => handleNumChange(e, "b")}
					/>
					<span>=</span>
					<strong style={{ fontSize: "1.1em" }}>
						{isNaN(sum) ? "—" : sum}
					</strong>
				</div>
			</div>

			{/* Other demos */}
			<div className="card">
				<h2>Braid + Loro Example</h2>
				<CollabText wsUrl="ws://localhost:3030/doc-sync" />
			</div>

			<div className="card">
				<WebGlDemo />
			</div>
		</div>
	);
}
