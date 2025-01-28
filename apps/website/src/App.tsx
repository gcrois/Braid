import { useState, useEffect } from "preact/hooks";
import { ChangeEvent } from "preact/compat";

import initCoreC from "@braid/c_example/wasm";
import initCoreRust from "@braid/rust_example/wasm";
import { fib as fibTS } from "@braid/ts_example";
import { initPyodide } from "@braid/py_example";

import { add } from "@braid/utils";

import "./App.scss";
import { CollabText } from "./CollabText";
import { WebGlDemo } from "./WebGlDemo";

// Types for the loaded WASM modules
type CModule = Awaited<ReturnType<typeof initCoreC>>;
type RustModule = Awaited<ReturnType<typeof initCoreRust>>;

export function App() {
    // 1) Modules
    const [cModule, setCModule] = useState<CModule | null>(null);
    const [rustModule, setRustModule] = useState<RustModule | null>(null);
    const [pyodideLoaded, setPyodideLoaded] = useState<boolean>(false);

    async function handleLoadPyodide() {
        try {
            const pyApi = await initPyodide();
            setPyodideLoaded(true);

            // For example, compute fib(10) from Python:
            const val = pyApi.pyFib(10);
            setPyFibVal(String(val));
        } catch (err) {
            console.error("Failed to load Pyodide", err);
        }
    }

    // 2) Inputs & results for fib
    const [fibInput, setFibInput] = useState("10");
    const [fibResultTS, setFibResultTS] = useState<number | null>(null);
    const [fibResultC, setFibResultC] = useState<number | null>(null);
    const [fibResultRust, setFibResultRust] = useState<number | null>(null);
    const [pyFibVal, setPyFibVal] = useState<string>("(not computed)");

    // 3) Simple add fields
    const [nums, setNums] = useState({ a: "5", b: "3" });

    // 4) Benchmark inputs & results
    const [benchN, setBenchN] = useState("25");
    const [benchTrials, setBenchTrials] = useState("1000");
    const [benchResults, setBenchResults] = useState("No benchmark run yet.");

    // On mount: load C & Rust modules
    useEffect(() => {
        initCoreC().then((core) => {
            // Calls `_main(0,0)` to show console output from C
            core._main(0, 0);
            setCModule(core);
        });
        initCoreRust().then((core) => {
            // Calls `main()` to show console output from Rust
            core.main();
            setRustModule(core);
        });
    }, []);

    function handleFibCompute(): void {
        const n = parseInt(fibInput, 10);
        if (!isNaN(n)) {
            // TypeScript fib
            setFibResultTS(fibTS(n));

            // C++ fib
            if (cModule) {
                setFibResultC(cModule._fib(n));
            }

            // Rust fib
            if (rustModule) {
                setFibResultRust(rustModule.fib(n));
            }
        }
    }

    // Simple add from @braid/utils
    const sum = add(parseInt(nums.a || "0", 10), parseInt(nums.b || "0", 10));

    function handleNumChange(e: ChangeEvent<HTMLInputElement>, key: "a" | "b"): void {
        setNums((old) => ({ ...old, [key]: e.currentTarget.value }));
    }

    // Benchmark function
    function runBenchmark(): void {
        if (!cModule || !rustModule) {
            setBenchResults("WASM modules are not loaded yet.");
            return;
        }

        const n = parseInt(benchN, 10);
        const trials = parseInt(benchTrials, 10);

        if (isNaN(n) || isNaN(trials) || trials <= 0) {
            setBenchResults("Invalid input for N or trials.");
            return;
        }

        // Benchmark TS
        let t0 = performance.now();
        for (let i = 0; i < trials; i++) {
            fibTS(n);
        }
        let t1 = performance.now();
        const tsTime = t1 - t0;

        // Benchmark C
        t0 = performance.now();
        for (let i = 0; i < trials; i++) {
            cModule._fib(n);
        }
        t1 = performance.now();
        const cTime = t1 - t0;

        // Benchmark Rust
        t0 = performance.now();
        for (let i = 0; i < trials; i++) {
            rustModule.fib(n);
        }
        t1 = performance.now();
        const rustTime = t1 - t0;

        setBenchResults(
            `Ran fib(${n}) ${trials} times each:\n` +
            `  - TS:   ${tsTime.toFixed(2)} ms\n` +
            `  - C:    ${cTime.toFixed(2)} ms\n` +
            `  - Rust: ${rustTime.toFixed(2)} ms`
        );
    }

    return (
        <div className="container">
            <h1>Braid WASM Demo</h1>
            <p>
                This page compares <strong>TypeScript fib</strong> to <strong>C fib</strong> and 
                <strong> Rust fib</strong> (both compiled to WASM), plus a simple{" "}
                <code>add()</code> from <code>@braid/utils</code>.
            </p>

            <div className="card">
                <h2>Pyodide (Python in the Browser)</h2>
                <button onClick={handleLoadPyodide} disabled={pyodideLoaded}>
                    {pyodideLoaded ? "Pyodide Loaded" : "Load Pyodide + fib(10)"}
                </button>
                <p>Python fib(10): {pyFibVal}</p>
            </div>

            {/* Fib Card */}
            <div className="card">
                <h2>Fibonacci from TS / C / Rust</h2>
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

            {/* Benchmark Card */}
            <div className="card">
                <h2>Fibonacci Benchmark</h2>
                <div className="row">
                    <label htmlFor="benchN">n:</label>
                    <input
                        id="benchN"
                        type="number"
                        value={benchN}
                        onChange={(e) => setBenchN(e.currentTarget.value)}
                    />
                    <label htmlFor="benchTrials">trials:</label>
                    <input
                        id="benchTrials"
                        type="number"
                        value={benchTrials}
                        onChange={(e) => setBenchTrials(e.currentTarget.value)}
                    />
                    <button onClick={runBenchmark}>Run Benchmark</button>
                </div>
                <pre style={{ marginTop: "1rem", background: "#222", padding: "1rem" }}>
                    {benchResults}
                </pre>
                <div className="container">
            <h2>Braid + Loro Example</h2>
                <CollabText wsUrl="ws://localhost:3030/doc-sync" />
            </div>
            </div>

            <div className="card">
                <WebGlDemo />
            </div>
        </div>
    );
}
