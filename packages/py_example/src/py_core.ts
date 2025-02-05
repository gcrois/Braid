import { loadPyodide } from "pyodide";
import fibCode from "./fib.py";

export async function initPyCore() {
	const pyodide = await loadPyodide();
	// Run the Python code to register the fib() function.
	await pyodide.runPythonAsync(fibCode);
	return {
		fib: (n: number): number => pyodide.runPython(`fib(${n})`),
	};
}

export type PyCore = Awaited<ReturnType<typeof initPyCore>>;
